// web/js/main.js

// Importamos tu módulo de IA y el módulo de la cámara
import { analizarSentadilla } from './ai_core.js';
import { iniciarCamara } from './camera.js';

// Obtenemos las referencias de la interfaz (del HTML)
const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const btnEmpezar = document.getElementById('btnEmpezar');
const mensajeEstado = document.getElementById('mensajeEstado');

// Función que se ejecuta en cada frame procesado por MediaPipe
function onResults(results) {
    // 1. Limpiar el lienzo
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // 2. Dibujar el video original en el fondo
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
        // 3. Dibujar el "esqueleto" (conexiones del cuerpo)
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});

        // 4. PASAR LOS DATOS A TU LÓGICA DE IA (ai_core.js)
        const datosSentadilla = analizarSentadilla(results.poseLandmarks);

        if (datosSentadilla.cuerpoCompleto) {
            // Escribir el ángulo detectado cerca de la rodilla
            canvasCtx.fillStyle = "white";
            canvasCtx.font = "20px Arial";
            canvasCtx.fillText(
                datosSentadilla.angulo, 
                datosSentadilla.coordenadasRodilla.x * canvasElement.width + 20, 
                datosSentadilla.coordenadasRodilla.y * canvasElement.height
            );
        } else {
            // Mostrar advertencia si el usuario no sale completo
            canvasCtx.fillStyle = "red";
            canvasCtx.font = "bold 30px Arial";
            canvasCtx.fillText("CUERPO INCOMPLETO - ALÉJATE", 80, 200);
        }

        // 5. Dibujar la Interfaz del Contador (Igual a tu OpenCV)
        // Fondo del contador
        canvasCtx.fillStyle = "rgba(16, 117, 245, 0.9)"; 
        canvasCtx.fillRect(0, 0, 250, 85);

        // Textos pequeños ("REPES" y "ESTADO")
        canvasCtx.fillStyle = "black";
        canvasCtx.font = "bold 16px Arial";
        canvasCtx.fillText("REPES", 15, 25);
        canvasCtx.fillText("ESTADO", 120, 25);

        // Variables grandes que vienen de tu IA (Contador y Estado)
        canvasCtx.fillStyle = "white";
        canvasCtx.font = "bold 40px Arial";
        canvasCtx.fillText(datosSentadilla.contador, 15, 70);
        canvasCtx.fillText(datosSentadilla.estado, 120, 70);
    }

    canvasCtx.restore();
}

// Configurar el modelo Pose de MediaPipe
const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});

pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResults);

// Conectar el botón para iniciar todo
btnEmpezar.addEventListener('click', () => {
    iniciarCamara(videoElement, pose, btnEmpezar, mensajeEstado);
});