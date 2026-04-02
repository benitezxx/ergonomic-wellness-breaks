// web/js/face_ai.js

// 1. Cargar los modelos locales
export async function cargarModelosFaciales() {
    console.log("Cargando modelos faciales...");
    const MODEL_URL = './models'; // Asegúrate de que esta carpeta exista con los 6 archivos
    
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    console.log("Modelos faciales cargados con éxito.");
}

// 2. WORKFLOW DE ENROLLMENT (Registro)
// Escanea la cara, extrae los 128 números y los guarda en localStorage
export async function registrarUsuario(videoElement, nombreUsuario) {
    // Detectamos la cara con la mayor precisión posible
    const deteccion = await faceapi.detectSingleFace(videoElement)
                                   .withFaceLandmarks()
                                   .withFaceDescriptor();
    
    if (!deteccion) {
        return { exito: false, mensaje: "No se detectó ninguna cara. Acércate más." };
    }
    
    // Obtenemos el array matemático
    const descriptorArray = Array.from(deteccion.descriptor);
    
    // Lo guardamos en localStorage simulando una base de datos
    // NOTA PARA BACKEND: Aquí es donde cambiarían esto por un POST a su API
    localStorage.setItem(`face_user_${nombreUsuario}`, JSON.stringify(descriptorArray));
    
    return { exito: true, mensaje: `Usuario ${nombreUsuario} registrado correctamente.` };
}

// 3. WORKFLOW DE CHECK-IN (Inicio de sesión)
// Compara la cara en vivo con los datos guardados
export async function verificarIdentidad(videoElement, nombreUsuario) {
    // Buscar en la "base de datos" local
    const datosGuardados = localStorage.getItem(`face_user_${nombreUsuario}`);
    
    if (!datosGuardados) {
        return { validado: false, mensaje: "Usuario no encontrado en la base de datos." };
    }

    // Convertir el JSON guardado de vuelta al formato matemático que usa la IA
    const arrayGuardado = new Float32Array(JSON.parse(datosGuardados));
    const labeledDescriptor = new faceapi.LabeledFaceDescriptors(nombreUsuario, [arrayGuardado]);
    
    // Creamos el comparador (0.6 es el umbral de distancia máxima, menor es más estricto)
    const faceMatcher = new faceapi.FaceMatcher([labeledDescriptor], 0.6);

    // Escaneamos la cara actual en la cámara
    const deteccionEnVivo = await faceapi.detectSingleFace(videoElement)
                                       .withFaceLandmarks()
                                       .withFaceDescriptor();
                                       
    if (!deteccionEnVivo) {
         return { validado: false, mensaje: "No hay nadie frente a la cámara." };
    }

    // Comparamos
    const match = faceMatcher.findBestMatch(deteccionEnVivo.descriptor);

    if (match.label === nombreUsuario) {
        return { validado: true, mensaje: `¡Hola de nuevo, ${nombreUsuario}!`, distancia: match.distance };
    } else {
        return { validado: false, mensaje: "El rostro no coincide con el usuario registrado." };
    }
}