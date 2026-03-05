import cv2
import mediapipe as mp
import csv
import numpy as np
import os

data_path = "data/gesture_data.csv"

if not os.path.exists("data"):
    os.makedirs("data")
    print("data/ folder banaya")
else:
    print("bhai pehle se hi hai")

print("setup complete")

if not os.path.exists(data_path):
    with open(data_path, mode='w', newline='') as f:
        writer = csv.writer(f)
        header = ['label']
        for i in range(21):
            header += [f'x{i}', f'y{i}', f'z{i}']
        writer.writerow(header)
        print("CSV file banayi with header")

current_gesture = None
collecting = False
sample_count = 0
max_sample = 200

gesture_keys = {
    ord('h'): 'Hello',
    ord('y'): 'Yes',
    ord('n'): 'No',
    ord('t'): 'Thanks',
    ord('i'): 'I Love You'
}

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

cap = cv2.VideoCapture(0)

while True:
    success, frame = cap.read()
    if not success:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )

            landmark_list = []
            for landmark in hand_landmarks.landmark:
                landmark_list.append([landmark.x, landmark.y, landmark.z])

            flat = np.array(landmark_list).flatten().tolist()

            if collecting and sample_count < max_sample:
                with open(data_path, mode='a', newline='') as f:
                    writer = csv.writer(f)
                    writer.writerow([current_gesture] + flat)
                    sample_count += 1
                    print(f"{current_gesture}: {sample_count}/{max_sample}")

            elif sample_count >= max_sample:
                print(f"{current_gesture} complete!")
                collecting = False

    key = cv2.waitKey(1) & 0xFF

    if key in gesture_keys:
        current_gesture = gesture_keys[key]
        sample_count = 0
        collecting = True
        print(f"Collecting: {current_gesture}")

    if key == ord('q'):
        break

    cv2.imshow("Data collection", frame)

cap.release()
cv2.destroyAllWindows()