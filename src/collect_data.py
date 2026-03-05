import cv2
import mediapipe as mp
import csv
import numpy as np
import json
import time 
import os

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode = False,
    max_num_hands = 2,
    min_detection_confidence = 0.7,
    min_tracking_confidence = 0.5
)
person_name = input("Enter Your firstName").strip().lower()


GESTURE_KEYS = {}
for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
    GESTURE_KEYS[ord(letter.lower())] = letter

GESTURE_KEYS[ord('1')] = 'Space'
GESTURE_KEYS[ord('2')] = 'Backspace'
GESTURE_KEYS[ord('3')] = 'FullStop'
GESTURE_KEYS[ord('4')] = 'NewLine'

MAX_SAMPLES = 200
current_gesture = None
sample_count = 0
collecting = False
quality_data = {}


def save_sample(person, gesture, landmarks):
    folder = f"data/raw/{person}"
    os.makedirs(folder,exist_ok = True)
    filepath = f"{folder}/{gesture}.csv"
    file_exists = os.path.exists(filepath)

    flat = []
    for lm in landmarks.landmark:
        flat += [lm.x,lm.y , lm.z]
    with open(filepath, mode="a",newline = "") as f:
        writer = csv.writer(f)

        if not file_exists:
            header = ["label"]
            for i in range(21):
                header += [f"x{i}", f"y{i}", f"z{i}"]
            writer.writerow(header)
        writer.writerow([gesture] + flat)


cap = cv2.VideoCapture(0)

while True:
    success, frame = cap.read()
    if not success:
        break
    frame = cv2.flip(frame,1)
    rgb = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)
    key = cv2.waitKey(1) & 0xFF
    if key in GESTURE_KEYS:
        current_gesture = GESTURE_KEYS[key]
        sample_count = 0
        collecting = True
        print(f"Collecting: {current_gesture}")
    if key == 27:
        break
    if result.multi_hand_landmarks:
        for hand_lm in result.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,hand_lm,mp_hands.HAND_CONNECTIONS)
            if collecting and sample_count < MAX_SAMPLES:
                save_sample(person_name,current_gesture,hand_lm)
                sample_count += 1
                print(f"{current_gesture}:{sample_count}/{MAX_SAMPLES}",end ="\r")
            
                if sample_count >= MAX_SAMPLES:
                  print(f"\n{current_gesture} DONE!")
                  collecting = False
    status = f"Collecting: {current_gesture} ({sample_count}/{MAX_SAMPLES})"
    if not collecting: status = "Press a Key to start"
    cv2.putText(frame,status,(10,30),cv2.FONT_HERSHEY_SIMPLEX, 0.7,(0,255,0), 2)
    cv2.imshow(f"Data Collection - {person_name}", frame)
cap.release()
cv2.destroyAllWindows()


