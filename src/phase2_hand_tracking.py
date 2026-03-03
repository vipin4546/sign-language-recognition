import cv2 as cv
import mediapipe as mp
import time
import numpy as np
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
print("Mediapipe",mp.__version__)
hands = mp_hands.Hands(
    static_image_mode = False,
    max_num_hands = 1,
    min_detection_confidence = 0.5,
    min_tracking_confidence = 0.5
)
cap = cv.VideoCapture(0)

while(True):
    success,frame = cap.read()
    if not success:
        break
    frame = cv.flip(frame,1)
    rgb = cv.cvtColor(frame,cv.COLOR_BGR2RGB)
    results = hands.process(rgb)
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                mp_hands.HAND_CONNECTIONS
            )
            index_tip = hand_landmarks.landmark[8]
        print(f"Index Tip → x:{index_tip.x:.2f} y:{index_tip.y:.2f} z:{index_tip.z:.2f}")
        h, w, c = frame.shape

        index_tip = hand_landmarks.landmark[8]
        thumb_tip = hand_landmarks.landmark[4]
        pinky_tip = hand_landmarks.landmark[20]

        index_pixel_x = int(index_tip.x * w)
        index_pixel_y = int(index_tip.y * h)
        thumb_pixel_x = int(thumb_tip.x * w)
        thumb_pixel_y = int(thumb_tip.y * h)
        pinky_pixel_x = int(pinky_tip.x * w)
        pinky_pixel_y = int(pinky_tip.y * h)
        
        cv.circle(frame, (index_pixel_x, index_pixel_y), 15, (0, 255, 0), -1)
        cv.circle(frame, (thumb_pixel_x, thumb_pixel_y), 15, (255, 0, 0), -1)
        cv.circle(frame, (pinky_pixel_x, pinky_pixel_y), 15, (0, 0, 255), -1)
        landmark_list = []
        for id, landmark in enumerate(hand_landmarks.landmark):
            landmark_list.append([landmark.x, landmark.y, landmark.z])
            flat = np.array(landmark_list).flatten()
        print(flat)
        print("Total landmarks:", len(landmark_list))
        print(f"Pixels → x:{index_pixel_x} y:{index_pixel_y}")

    cv.imshow("window",frame)




    if cv.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv.destroyAllWindows()
