// web/js/camera.js

export function iniciarCamara(videoElement, poseModel, btnElement, statusElement) {
    btnElement.disabled = true;
    btnElement.innerText = "Iniciando...";
    statusElement.innerText = "Cargando modelo y encendiendo cámara...";

    // Usamos la utilidad de cámara de MediaPipe
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            // Cada vez que hay un nuevo frame, se lo enviamos a la IA (Pose)
            await poseModel.send({ image: videoElement });
        },
        width: 640,
        height: 480
    });

    camera.start()
        .then(() => {
            btnElement.style.display = "none";
            statusElement.innerText = "¡En vivo! Haz tus sentadillas.";
        })
        .catch(err => {
            console.error("Error al iniciar la cámara:", err);
            statusElement.innerText = "Error: Asegúrate de dar permisos de cámara.";
            btnElement.disabled = false;
            btnElement.innerText = "Intentar de nuevo";
        });
}