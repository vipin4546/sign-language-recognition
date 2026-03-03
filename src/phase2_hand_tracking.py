import cv2 as cv
import mediapipe as mp
import time
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

        pixel_x = int(index_tip.x * w)
        pixel_y = int(index_tip.y * h)
        cv.circle(frame, (pixel_x, pixel_y), 15, (0, 255, 0), -1)

        print(f"Pixels → x:{pixel_x} y:{pixel_y}")

    cv.imshow("window",frame)




    if cv.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv.destroyAllWindows()
