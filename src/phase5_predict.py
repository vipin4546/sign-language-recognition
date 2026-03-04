import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
from tensorflow import keras
import pickle 
model = keras.models.load_model('models/gesture_model.h5')
with open('models/label_encoder.pkl','rb') as f:
    le = pickle.load(f)
print("Model Loaded")
print("Classes",le.classes_)
mp_hands =  mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
hands = mp_hands.Hands(
    static_image_mode = False,
    max_num_hands = 1,
    min_tracking_confidence = 0.5,
    min_detection_confidence = 0.5
)

cap = cv2.VideoCapture(0)
while True:
    success,frame = cap.read()
    if not success:
        break
    frame = cv2.flip(frame,1)
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
            
            flat = np.array(landmark_list).flatten()
            flat = flat.reshape(1, 63)
            prediction = model.predict(flat, verbose=0)
            predicted_index = np.argmax(prediction)
            predicted_label = le.inverse_transform([predicted_index])[0]
            print(predicted_label)
            cv2.putText(
            frame,
            predicted_label,
            (10, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            2,
            (0, 255, 0),
            3
            )
            confidence = np.max(prediction) * 100
            cv2.putText(
            frame,
            f"{confidence:.1f}%",
            (10, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
    1,
            (255, 255, 0),
             2
            )



    cv2.imshow("Gesture Recognition", frame)
    
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv2.destroyAllWindows()


