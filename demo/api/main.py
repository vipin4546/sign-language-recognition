import os
os.environ["DISPLAY"] = ":99"
os.environ["QT_QPA_PLATFORM"] = "offscreen"

from fastapi import FastAPI, WebSocket
import tensorflow as tf
import pickle
import numpy as np
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import json
from fastapi.staticfiles import StaticFiles

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()
app.mount("/static", StaticFiles(directory="demo/static", check_dir=False), name="static")


model = tf.keras.models.load_model(os.path.join(BASE_DIR, "../models/gesture_model.h5"))

with open(os.path.join(BASE_DIR, "../models/label_encoder.pkl"), "rb") as f:
    label_encoder = pickle.load(f)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7
)


@app.get("/")
def home():
    return {"message": "Sign language API is running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_bytes()
        np_array = np.frombuffer(data, np.uint8)
        image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb_image)
        if result.multi_hand_landmarks:
            landmarks = result.multi_hand_landmarks[0]
            keypoints =[]
            for landmark in landmarks.landmark:
                keypoints.append(landmark.x)
                keypoints.append(landmark.y)
                keypoints.append(landmark.z)
            keypoints = np.array(keypoints).reshape(1,-1)
            prediction = model.predict(keypoints)
            class_index = np.argmax(prediction)
            gesture = label_encoder.inverse_transform([class_index])[0]
            confidence = float(np.max(prediction) * 100)
            await websocket.send_text(json.dumps({"gesture": gesture,"confidence":confidence}))

        else:
            await websocket.send_text("no hand detected")
            continue




