// web/js/ai_core.js

let contador = 0;
let estado = "arriba";

export function calcularAngulo(a, b, c) {
    const radianes = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angulo = Math.abs(radianes * 180.0 / Math.PI);
    if (angulo > 180.0) angulo = 360.0 - angulo;
    return angulo;
}

// Resetear el contador al cambiar de ejercicio
export function resetearContador() {
    contador = 0;
    estado = "arriba";
}

export function analizarEjercicio(poseLandmarks, tipoEjercicio) {
    if (!poseLandmarks) return { contador, estado, cuerpoCompleto: false };

    let p1, p2, p3, umbralArriba, umbralAbajo;

    if (tipoEjercicio === 'sentadillas') {
        p1 = poseLandmarks[23]; // Cadera
        p2 = poseLandmarks[25]; // Rodilla
        p3 = poseLandmarks[27]; // Tobillo
        umbralArriba = 160;
        umbralAbajo = 90;
    } else if (tipoEjercicio === 'lagartijas') {
        p1 = poseLandmarks[11]; // Hombro
        p2 = poseLandmarks[13]; // Codo
        p3 = poseLandmarks[15]; // Muñeca
        umbralArriba = 160;
        umbralAbajo = 90; 
    } else if (tipoEjercicio === 'estiramiento') {
        p1 = poseLandmarks[11]; // Hombro
        p2 = poseLandmarks[23]; // Cadera
        p3 = poseLandmarks[27]; // Tobillo
        umbralArriba = 160;
        umbralAbajo = 90; // Doblarse por completo
    }

    if (p1.visibility > 0.6 && p2.visibility > 0.6 && p3.visibility > 0.6) {
        const angulo = calcularAngulo(p1, p2, p3);
        let repeticionCompletada = false;
        let errorMovimiento = false; // El trigger para tu sonido

        // Lógica de estados y detección de errores
        if (angulo > umbralArriba) {
            // Si estaba a medias y subió, es un error
            if (estado === "a_medias") {
                errorMovimiento = true; 
            }
            estado = "arriba";
        }
        
        // Si empezó a bajar pero no llega a la meta
        if (angulo < (umbralArriba - 20) && angulo > umbralAbajo && estado === "arriba") {
            estado = "a_medias"; 
        }

        // Si llegó a la meta correcta
        if (angulo < umbralAbajo && (estado === "arriba" || estado === "a_medias")) {
            estado = "abajo";
            contador += 1;
            repeticionCompletada = true;
        }

        return { 
            contador, estado, 
            angulo: Math.round(angulo), 
            cuerpoCompleto: true, 
            repeticionCompletada,
            errorMovimiento // Lo enviamos para reproducir el audio
        };
    } else {
        return { contador, estado, cuerpoCompleto: false };
    }
}