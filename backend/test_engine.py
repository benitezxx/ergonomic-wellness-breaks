import cv2
from ai.pose_engine import PoseEngine

engine = PoseEngine()

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    landmarks = engine.process_frame(frame)

    if landmarks:
        frame = engine.draw_landmarks(frame, landmarks)

    cv2.imshow("Pose Engine Test", frame)

    if cv2.waitKey(1) == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()