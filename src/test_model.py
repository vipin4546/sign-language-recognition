import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
import pickle

VERSION = "v1"

model = tf.keras.models.load_model(f"models/{VERSION}/gesture_model.h5")
with open(f"models/{VERSION}/label_encoder.pkl", "rb") as f:
    le = pickle.load(f)

print(f"Model loaded — {len(le.classes_)} gestures: {le.classes_}")

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

CONFIDENCE_THRESHOLD = 0.70

cap = cv2.VideoCapture(0)
print("Press Q to quit.")

while True:
    ok, frame = cap.read()
    if not ok:
        break

    frame = cv2.flip(frame, 1)
    rgb   = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    res   = hands.process(rgb)

    if res.multi_hand_landmarks:
        hand = res.multi_hand_landmarks[0]
        mp_drawing.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)

        lms = []
        for lm in hand.landmark:
            lms += [lm.x, lm.y, lm.z]

        pred = model.predict(np.array([lms]), verbose=0)[0]
        top3 = pred.argsort()[-3:][::-1]

        for i, idx in enumerate(top3):
            conf  = pred[idx]
            label = f"{le.classes_[idx]}: {conf*100:.1f}%"
            color = (0, 255, 0) if i == 0 else (160, 160, 160)
            cv2.putText(frame, label, (10, 45 + i * 42),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.1, color, 2)

        if pred[top3[0]] < CONFIDENCE_THRESHOLD:
            cv2.putText(frame, "LOW CONFIDENCE", (10, 175),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    cv2.imshow(f"Model Test v{VERSION} — press Q to quit", frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()