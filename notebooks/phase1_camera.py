import time
import cv2 as cv
current_time = time.time()
prev_time = current_time
print(current_time)
print("OpenCv",cv.__version__)
cap = cv.VideoCapture(0)
print(cap.isOpened())
success , frame = cap.read()
print("Top-left pixel", frame[0,0])
print("Middle pixel", frame[540,960])
gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
print("Color shape", frame.shape)
print("Gray shape", gray.shape)

while True:
    curr_time = time.time()
    fps = 1/(curr_time - prev_time)
    prev_time = curr_time
    success , frame = cap.read()
    if not success:
        break
    frame = cv.flip(frame,1)
    gray = cv.cvtColor(frame,cv.COLOR_BGR2GRAY)
    cv.putText(gray,f"FPS:{int(fps)}",(10,30),cv.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv.imshow("gray ", gray)
    cv.imshow("color ", frame)
    if cv.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv.destroyAllWindows()       
print("success", success)
print("frame shape", frame.shape)