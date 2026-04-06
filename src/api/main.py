"""
Sign Language Recognition Backend
===================================
WebSocket server that:
  1. Accepts JPEG frames from the React frontend
  2. Uses MediaPipe to extract 21 hand landmarks (63 features)
  3. Runs a TensorFlow model to predict gesture (A-Z + special keys)
  4. Implements hold-to-confirm logic (gesture must be held ~2 seconds)
  5. Builds up a text string and sends updates back to the frontend

Frontend expects JSON responses:
  {
    "text":     str,       # full accumulated sentence so far
    "current":  str|null,  # gesture label being held right now
    "progress": float,     # 0.0 – 1.0, how close to confirming
    "speak":    bool       # true when a sentence is ready to be spoken
  }
"""

import asyncio
import io
import logging
import os
import pickle
import time
from collections import deque

import mediapipe as mp
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# ──────────────────────────────────────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Paths — model is loaded from models/v1/  (same layout as training code)
# ──────────────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR  = "/Users/vipin/Documents/Coding/Projects/Sign_ Language_Recognition/models/v1"
MODEL_PATH = os.path.join(MODEL_DIR, "gesture_model.h5")
LE_PATH    = os.path.join(MODEL_DIR, "label_encoder.pkl")

# ──────────────────────────────────────────────────────────────────────────────
# Load TensorFlow model + label encoder  (done once at startup)
# ──────────────────────────────────────────────────────────────────────────────
try:
    import tensorflow as tf
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(LE_PATH, "rb") as f:
        le = pickle.load(f)
    log.info("✅ Model loaded — %d gestures: %s", len(le.classes_), le.classes_)
except Exception as exc:
    log.error("❌ Could not load model: %s", exc)
    log.error("   Expected files:\n   %s\n   %s", MODEL_PATH, LE_PATH)
    model = None
    le    = None

# ──────────────────────────────────────────────────────────────────────────────
# MediaPipe hands (one instance reused per connection via ConnectionState)
# ──────────────────────────────────────────────────────────────────────────────
mp_hands    = mp.solutions.hands
MP_CFG      = dict(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.70,
    min_tracking_confidence=0.50,
)

# ──────────────────────────────────────────────────────────────────────────────
# Gesture → text-output mapping
# Special gestures produce control actions instead of letters.
# ──────────────────────────────────────────────────────────────────────────────
SPECIAL = {
    "Space":    " ",
    "Backspace": None,   # handled separately
    "FullStop": ".",
    "NewLine":  "\n",
}

# ──────────────────────────────────────────────────────────────────────────────
# Hold-to-confirm parameters
# ──────────────────────────────────────────────────────────────────────────────
HOLD_SECONDS        = 2.0    # seconds a gesture must be held to confirm
CONFIDENCE_THRESHOLD = 0.70  # model confidence must exceed this
COOLDOWN_SECONDS    = 0.8    # minimum pause between two confirmed gestures
SMOOTH_WINDOW       = 5      # frames used for majority-vote smoothing

# ──────────────────────────────────────────────────────────────────────────────
# FastAPI app
# ──────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Sign Language Recognition API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────────────────────
# Per-connection state (keeps everything isolated per WebSocket client)
# ──────────────────────────────────────────────────────────────────────────────
class ConnectionState:
    def __init__(self):
        self.hands_processor = mp_hands.Hands(**MP_CFG)

        # Text being built up
        self.text: str = ""

        # Hold logic
        self.current_gesture: str | None = None
        self.hold_start: float            = 0.0
        self.last_confirmed_time: float   = 0.0

        # Smoothing buffer — stores last N predicted labels
        self.recent_preds: deque = deque(maxlen=SMOOTH_WINDOW)

        # Speak flag — set True once per sentence-end, cleared after send
        self.speak: bool = False

    def close(self):
        self.hands_processor.close()


# ──────────────────────────────────────────────────────────────────────────────
# Core inference helpers
# ──────────────────────────────────────────────────────────────────────────────

def extract_landmarks(frame_rgb: np.ndarray, hands_processor) -> np.ndarray | None:
    """
    Run MediaPipe on an RGB frame.
    Returns a (63,) float32 array of [x, y, z] × 21 landmarks,
    or None if no hand is detected.
    """
    result = hands_processor.process(frame_rgb)
    if not result.multi_hand_landmarks:
        return None
    hand = result.multi_hand_landmarks[0]
    lms  = []
    for lm in hand.landmark:
        lms += [lm.x, lm.y, lm.z]
    return np.array(lms, dtype=np.float32)


def predict_gesture(landmarks: np.ndarray) -> tuple[str, float]:
    """
    Run the TF model on landmarks.
    Returns (label, confidence).
    """
    if model is None or le is None:
        return ("?", 0.0)
    probs = model.predict(landmarks[np.newaxis, :], verbose=0)[0]
    idx   = int(np.argmax(probs))
    return (le.classes_[idx], float(probs[idx]))


def smooth_prediction(recent: deque) -> str | None:
    """
    Majority vote over the last N predictions.
    Returns the dominant label, or None if the deque is empty.
    """
    if not recent:
        return None
    counts: dict[str, int] = {}
    for label in recent:
        counts[label] = counts.get(label, 0) + 1
    return max(counts, key=counts.__getitem__)


# ──────────────────────────────────────────────────────────────────────────────
# Hold-to-confirm logic
# ──────────────────────────────────────────────────────────────────────────────

def apply_gesture(state: ConnectionState, label: str) -> bool:
    """
    Append a confirmed gesture to state.text.
    Returns True when a full-stop is typed (triggers TTS).
    """
    # Special keys
    if label == "Backspace":
        state.text = state.text[:-1]
        return False
    if label == "FullStop":
        state.text += "."
        return True          # speak the sentence
    if label == "Space":
        state.text += " "
        return False
    if label == "NewLine":
        state.text += "\n"
        return True
    # Regular letter
    state.text += label
    return False


def process_frame(
    state: ConnectionState,
    frame_rgb: np.ndarray,
) -> dict:
    """
    Full pipeline for one frame.
    Returns the JSON payload to send back to the frontend.
    """
    now = time.monotonic()

    # ── 1. Extract landmarks ──────────────────────────────────────────────────
    landmarks = extract_landmarks(frame_rgb, state.hands_processor)

    if landmarks is None:
        # No hand detected → reset hold timer
        state.current_gesture = None
        state.hold_start       = 0.0
        state.recent_preds.clear()
        return _payload(state, None, 0.0)

    # ── 2. Predict + smooth ───────────────────────────────────────────────────
    raw_label, confidence = predict_gesture(landmarks)

    if confidence < CONFIDENCE_THRESHOLD:
        state.current_gesture = None
        state.hold_start       = 0.0
        state.recent_preds.clear()
        return _payload(state, None, 0.0)

    state.recent_preds.append(raw_label)
    smoothed = smooth_prediction(state.recent_preds)

    # ── 3. Hold-to-confirm ────────────────────────────────────────────────────
    if smoothed != state.current_gesture:
        # Gesture changed → restart timer
        state.current_gesture = smoothed
        state.hold_start       = now

    held_for = now - state.hold_start
    progress = min(held_for / HOLD_SECONDS, 1.0)

    confirmed = (
        progress >= 1.0
        and (now - state.last_confirmed_time) > COOLDOWN_SECONDS
    )

    if confirmed and smoothed is not None:
        state.last_confirmed_time = now
        state.hold_start           = now  # restart so next confirm needs another hold
        state.speak                = apply_gesture(state, smoothed)
        progress                   = 0.0  # visual reset after confirm
        log.info("Confirmed: %-10s  text=%r", smoothed, state.text)

    speak_now      = state.speak
    state.speak    = False   # consume flag

    return _payload(state, smoothed, progress, speak_now)


def _payload(
    state: ConnectionState,
    current: str | None,
    progress: float,
    speak: bool = False,
) -> dict:
    return {
        "text":     state.text,
        "current":  current,
        "progress": round(progress, 3),
        "speak":    speak,
    }


# ──────────────────────────────────────────────────────────────────────────────
# WebSocket endpoint
# ──────────────────────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    state = ConnectionState()
    log.info("Client connected  [%s]", ws.client)

    try:
        while True:
            # Receive raw bytes (JPEG blob from frontend)
            data = await ws.receive_bytes()

            # Decode JPEG → numpy RGB array (runs in thread pool so it doesn't
            # block the event loop)
            frame_rgb = await asyncio.get_event_loop().run_in_executor(
                None, _decode_jpeg, data
            )
            if frame_rgb is None:
                continue

            # Run inference (also off-thread)
            payload = await asyncio.get_event_loop().run_in_executor(
                None, process_frame, state, frame_rgb
            )

            await ws.send_json(payload)

    except WebSocketDisconnect:
        log.info("Client disconnected [%s]", ws.client)
    except Exception as exc:
        log.error("WebSocket error: %s", exc, exc_info=True)
    finally:
        state.close()


def _decode_jpeg(data: bytes) -> np.ndarray | None:
    """Decode JPEG bytes to an RGB numpy array."""
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
        return np.array(img)
    except Exception as exc:
        log.warning("Failed to decode image: %s", exc)
        return None


# ──────────────────────────────────────────────────────────────────────────────
# REST helpers  (optional — useful for debugging / health checks)
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":       "ok",
        "model_loaded": model is not None,
        "gestures":     list(le.classes_) if le else [],
    }


@app.get("/")
def root():
    return {"message": "Sign Language Recognition API — connect via ws://localhost:8000/ws"}


# ──────────────────────────────────────────────────────────────────────────────
# Entry point
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)