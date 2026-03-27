// web/js/ai_core.js

// Variables de estado (Equivalente a tu contador y estado en Python)
let contador = 0;
let estado = "-";

/**
 * Función matemática para calcular el ángulo entre 3 puntos
 * Equivalente exacto a calcular_angulo(a, b, c) en sentadillasv2.py
 */
export function calcularAngulo(a, b, c) {
    const radianes = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angulo = Math.abs(radianes * 180.0 / Math.PI);
    
    if (angulo > 180.0) {
        angulo = 360.0 - angulo;
    }
    return angulo;
}

/**
 * Esta función recibe los landmarks de MediaPipe y aplica tu lógica
 */
export function analizarSentadilla(poseLandmarks) {
    // Si no hay detección, regresamos los valores actuales
    if (!poseLandmarks) {
        return { contador, estado, cuerpoCompleto: false };
    }

    // Extraer los landmarks de la pierna izquierda (índices de MediaPipe JS)
    // 23 = Cadera, 25 = Rodilla, 27 = Tobillo
    const cadera = poseLandmarks[23];
    const rodilla = poseLandmarks[25];
    const tobillo = poseLandmarks[27];

    // Solo si está más del 60% seguro de ver los tres puntos, calcula el angulo
    if (cadera.visibility > 0.6 && rodilla.visibility > 0.6 && tobillo.visibility > 0.6) {
        
        const angulo = calcularAngulo(cadera, rodilla, tobillo);

        // Lógica de estados para sumar repeticiones
        if (angulo > 160) {
            estado = "arriba";
        }
        if (angulo < 90 && estado === "arriba") {
            estado = "abajo";
            contador += 1;
        }

        // Devolvemos la información lista para que la interfaz la muestre
        return {
            contador: contador,
            estado: estado,
            angulo: Math.round(angulo),
            cuerpoCompleto: true,
            coordenadasRodilla: rodilla // Útil si queremos dibujar el ángulo encima
        };

    } else {
        // Equivalente a tu aviso 'CUERPO INCOMPLETO - ALEJATE'
        return {
            contador: contador,
            estado: estado,
            cuerpoCompleto: false
        };
    }
}