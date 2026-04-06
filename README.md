# ergonomic-wellness-breaks
AI-based ergonomic wellness system that uses computer vision to detect body posture, validate exercises in real time, and deliver rewards to promote healthy habits in organizations.

Este proyecto es un sistema de visión computacional y validación biométrica que cuenta repeticiones de ejercicios (sentadillas, lagartijas y estiramientos) en tiempo real utilizando la cámara web. 

El proyecto cuenta con una versión local en Python y una **versión Web modular** (recomendada) que ejecuta toda la Inteligencia Artificial directamente en el navegador del usuario para garantizar latencia cero y máxima privacidad.

## Tecnologías y Dependencias

### Para la Versión Web (Frontend & IA Local)
La aplicación web es estática y procesa todo del lado del cliente.
- **HTML5, CSS3, Vanilla JavaScript** (Arquitectura modular).
- **MediaPipe Pose (Web):** Para la detección del esqueleto y cálculo de ángulos. (Cargado vía CDN).
- **@vladmandic/face-api:** Para el registro y validación facial biométrica. (Cargado vía CDN).
- **Python 3.x:** Únicamente utilizado para levantar un servidor local rápido (`http.server`) y evitar bloqueos de CORS en el navegador.

### Para la Versión de Escritorio (Scripts de prueba)
Si deseas ejecutar `sentadillasv2.py`:
- Python 3.8 o superior.
- Librerías listadas en `requirements.txt` (`opencv-python`, `mediapipe`, `numpy`).

## Estructura del Proyecto

\`\`\`text
ACTIVE-PAUSES/
├── sentadillasv2.py       # Script original de prueba en OpenCV
├── requirements.txt       # Dependencias para el entorno de Python
└── web/                   # 🌐 VERSIÓN WEB PRINCIPAL
    ├── index.html         # Interfaz de usuario y login facial
    ├── audio/             # Triggers de sonido (error.mp3, success.mp3, finished.mp3)
    ├── css/               
    │   └── styles.css     # Estilos de la interfaz
    ├── js/                
    │   ├── main.js        # Controlador principal (Máquina de estados de la rutina)
    │   ├── ai_core.js     # Lógica matemática, ángulos y validación de ejercicios
    │   ├── face_ai.js     # Motor de inscripción y login biométrico
    │   └── camera.js      # Gestión de hardware de la webcam
    └── models/            # Modelos matemáticos de Face-API (.bin y .json)
\`\`\`

##  Cómo ejecutar la versión Web

1. **Clona o descarga este repositorio** en tu máquina local.
2. Asegúrate de tener **Python** instalado en tu sistema.
3. Abre una terminal y navega hasta la carpeta raíz del proyecto (`ACTIVE-PAUSES`).
4. Levanta el servidor local ejecutando el siguiente comando:
   \`\`\`bash
   python -m http.server 8000
   \`\`\`
   *(Nota: en algunos sistemas como macOS/Linux el comando puede ser `python3 -m http.server 8000`)*
5. Abre tu navegador web (Chrome, Edge, Firefox) y ve a la dirección:
   **http://localhost:8000/web/**
6. Otorga los permisos de cámara cuando el navegador lo solicite.

## Uso (Flujo de la aplicación)
1. **Registro:** Ingresa tu nombre y haz clic en "Registrar mi Rostro". La IA extraerá tu descriptor facial y lo guardará.
2. **Login:** Haz clic en "Iniciar Sesión". El sistema validará que seas tú.
3. **Rutina:** Sigue las instrucciones en pantalla. La aplicación cambiará automáticamente entre Sentadillas, Lagartijas y Estiramiento al completar tus metas. Escucharás sonidos de feedback si realizas un movimiento incorrecto.