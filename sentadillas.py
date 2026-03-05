import mediapipe as mp
import cv2
import numpy as np

# Inicializar MediaPipe Pose
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# Función matemática para calcular el ángulo entre 3 puntos
def calcular_angulo(a, b, c):
    a = np.array(a) # Primera (Ej. Cadera)
    b = np.array(b) # Media (Ej. Rodilla)
    c = np.array(c) # Final (Ej. Tobillo)
    
    radianes = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angulo = np.abs(radianes*180.0/np.pi)
    
    if angulo > 180.0:
        angulo = 360 - angulo
        
    return angulo

# Iniciar captura de video (0 es la cámara por defecto)
cap = cv2.VideoCapture(0)

# Variables para contar
contador = 0
estado = None # "arriba" o "abajo"

# Configurar el modelo de Pose
with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Recolorar la imagen a RGB (MediaPipe lo requiere)
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        
        # Procesar la imagen y detectar la pose
        results = pose.process(image)
        
        # Recolorar de vuelta a BGR para mostrar en OpenCV
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        # Extraer los landmarks
        try:
            landmarks = results.pose_landmarks.landmark
            
            # Obtener coordenadas de la pierna izquierda (puntos 23, 25, 27)
            cadera = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
            rodilla = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
            tobillo = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
            
            # Calcular el ángulo
            angulo = calcular_angulo(cadera, rodilla, tobillo)
            
            # Mostrar el ángulo en la pantalla justo en la rodilla
            cv2.putText(image, str(int(angulo)), 
                           tuple(np.multiply(rodilla, [640, 480]).astype(int)), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA
                                )
            
            # Lógica del contador de sentadillas
            if angulo > 160:
                estado = "arriba"
            if angulo < 90 and estado == "arriba":
                estado = "abajo"
                contador += 1
                print(f"Sentadillas: {contador}")
                
        except:
            pass # Si no detecta cuerpo, no hace nada y sigue
        
        # Mostrar el contador y estado en pantalla (Interfaz básica)
        cv2.rectangle(image, (0,0), (225,73), (245,117,16), -1)
        
        # Texto: Repeticiones
        cv2.putText(image, 'REPES', (15,12), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1, cv2.LINE_AA)
        cv2.putText(image, str(contador), (10,60), cv2.FONT_HERSHEY_SIMPLEX, 2, (255,255,255), 2, cv2.LINE_AA)
        
        # Texto: Estado
        cv2.putText(image, 'ESTADO', (100,12), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 1, cv2.LINE_AA)
        cv2.putText(image, estado, (95,60), cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 2, cv2.LINE_AA)
        
        # Dibujar las conexiones del cuerpo
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
        
        cv2.imshow('Detector de Sentadillas', image)
        
        # Presiona 'q' para salir
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()