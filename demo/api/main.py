import os
import json
import cv2
import pickle
import numpy as np
import tensorflow as tf
import mediapipe as mp

from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles

# -----------------------------
# PATH SETUP
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "../models/gesture_model.h5")
ENCODER_PATH = os.path.join(BASE_DIR, "../models/label_encoder.pkl")

# -----------------------------
# FASTAPI APP
# -----------------------------
app = FastAPI()

# Serve frontend (optional)
app.mount("/static", StaticFiles(directory="demo/static", check_dir=False), name="static")

# -----------------------------
# LOAD MODEL + ENCODER
# -----------------------------
model = tf.keras.models.load_model(MODEL_PATH)

with open(ENCODER_PATH, "rb") as f:
    label_encoder = pickle.load(f)

# -----------------------------
# MEDIAPIPE SETUP
# -----------------------------
mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7
)

# -----------------------------
# API ROUTES
# -----------------------------
@app.get("/")
def home():
    return {"message": "Sign Language API is running 🚀"}


# -----------------------------
# WEBSOCKET ENDPOINT
# -----------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_bytes()

            # Convert bytes → image
            np_array = np.frombuffer(data, np.uint8)
            image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

            if image is None:
                continue

            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            # Detect hand
            result = hands.process(rgb_image)

            if result.multi_hand_landmarks:
                landmarks = result.multi_hand_landmarks[0]

                keypoints = []
                for lm in landmarks.landmark:
                    keypoints.extend([lm.x, lm.y, lm.z])

                keypoints = np.array(keypoints).reshape(1, -1)

                # Prediction
                prediction = model.predict(keypoints, verbose=0)
                class_index = np.argmax(prediction)

                gesture = label_encoder.inverse_transform([class_index])[0]
                confidence = float(np.max(prediction))

                # Send structured response (frontend ready)
                response = {
                    "text": gesture,
                    "current": gesture,
                    "progress": round(confidence, 3),
                    "speak": False
                }

                await websocket.send_text(json.dumps(response))

            else:
                # No hand detected
                response = {
                    "text": "",
                    "current": None,
                    "progress": 0,
                    "speak": False
                }

                await websocket.send_text(json.dumps(response))

    except Exception as e:
        print("Client disconnected:", e)