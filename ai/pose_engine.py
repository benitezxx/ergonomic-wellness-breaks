import cv2
import mediapipe as mp


class PoseEngine:
    """
    Core AI engine responsible for:
    - Initializing MediaPipe Pose
    - Processing image frames
    - Returning skeletal landmarks
    """

    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils

        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def process_frame(self, frame):
        """
        Receives a BGR frame (OpenCV format),
        processes it, and returns pose landmarks if detected.
        """

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_frame)

        if results.pose_landmarks:
            return results.pose_landmarks

        return None

    def draw_landmarks(self, frame, landmarks):
        """
        Optional helper method for debugging.
        Draws pose landmarks on the frame.
        """

        self.mp_drawing.draw_landmarks(
            frame,
            landmarks,
            self.mp_pose.POSE_CONNECTIONS
        )

        return frame