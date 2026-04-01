// web/js/main.js

import { analizarEjercicio, resetearContador } from './ai_core.js';
import { iniciarCamara } from './camera.js';

const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const btnEmpezar = document.getElementById('btnEmpezar');
const mensajeEstado = document.getElementById('mensajeEstado');

const rutina = [
    { id: 'sentadillas', nombre: 'Sentadillas', meta: 5 },
    { id: 'lagartijas', nombre: 'Lagartijas', meta: 5 },
    { id: 'estiramiento', nombre: 'Tocar los pies', meta: 5 }
];

let indiceRutina = 0;
let enPantallaDeCarga = true;
let tiempoInicioCarga = Date.now();
let finalSonado = false; // Para que el sonido de fin solo suene una vez

// --- CONFIGURACIÓN DE SONIDOS ---
const audioError = new Audio('./error.mp3'); 
const audioSuccess = new Audio('./success.mp3');  // Sonido para repetición buena
const audioFinished = new Audio('./finished.mp3'); // Sonido para fin de rutina

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    // ESTADO: RUTINA FINALIZADA
    if (indiceRutina >= rutina.length) {
        if (!finalSonado) {
            audioFinished.play().catch(e => console.log("Error al tocar finished.mp3", e));
            finalSonado = true;
        }
        canvasCtx.fillStyle = "rgba(0, 0, 0, 0.8)";
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.fillStyle = "gold";
        canvasCtx.font = "bold 50px Arial";
        canvasCtx.textAlign = "center";
        canvasCtx.fillText("¡RUTINA COMPLETADA!", canvasElement.width / 2, canvasElement.height / 2);
        canvasCtx.restore();
        return;
    }

    const ejercicioActual = rutina[indiceRutina];

    // ESTADO: PANTALLA DE CARGA
    if (enPantallaDeCarga) {
        canvasCtx.fillStyle = "rgba(0, 200, 100, 0.9)";
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.fillStyle = "white";
        canvasCtx.font = "bold 40px Arial";
        canvasCtx.textAlign = "center";
        canvasCtx.fillText(`PREPÁRATE`, canvasElement.width / 2, 150);
        canvasCtx.fillText(`Siguiente: ${ejercicioActual.nombre}`, canvasElement.width / 2, 220);

        if (Date.now() - tiempoInicioCarga > 4000) {
            enPantallaDeCarga = false;
            resetearContador();
            canvasCtx.textAlign = "left"; 
        }
        canvasCtx.restore();
        return;
    }

    // ESTADO: EJERCICIO ACTIVO
    if (results.poseLandmarks && !enPantallaDeCarga) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});

        const datosIA = analizarEjercicio(results.poseLandmarks, ejercicioActual.id);

        if (datosIA.cuerpoCompleto) {
            // TRIGGER 1: Sonido de Error
            if (datosIA.errorMovimiento) {
                audioError.play().catch(e => console.log("Error al tocar error.mp3", e));
                canvasCtx.fillStyle = "rgba(255, 0, 0, 0.4)";
                canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
            }

            // TRIGGER 2: Sonido de Éxito (Repetición buena)
            if (datosIA.repeticionCompletada) {
                audioSuccess.play().catch(e => console.log("Error al tocar success.mp3", e));
            }

            // CAMBIO DE EJERCICIO
            if (datosIA.contador >= ejercicioActual.meta) {
                indiceRutina++;
                enPantallaDeCarga = true;
                tiempoInicioCarga = Date.now();
            }
        } else {
            canvasCtx.fillStyle = "red";
            canvasCtx.font = "bold 30px Arial";
            canvasCtx.fillText("CUERPO INCOMPLETO - ALÉJATE", 80, 200);
        }

        // INTERFAZ VISUAL
        canvasCtx.fillStyle = "rgba(16, 117, 245, 0.9)"; 
        canvasCtx.fillRect(0, 0, 250, 85);
        canvasCtx.fillStyle = "black";
        canvasCtx.font = "bold 16px Arial";
        canvasCtx.fillText(`REPES (${ejercicioActual.nombre})`, 15, 25);
        canvasCtx.fillText("ESTADO", 150, 25);
        canvasCtx.fillStyle = "white";
        canvasCtx.font = "bold 40px Arial";
        canvasCtx.fillText(`${datosIA.contador}/${ejercicioActual.meta}`, 15, 70);
        canvasCtx.fillText(datosIA.estado, 150, 70);
    }

    canvasCtx.restore();
}

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

btnEmpezar.addEventListener('click', () => {
    iniciarCamara(videoElement, pose, btnEmpezar, mensajeEstado);
});