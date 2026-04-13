// Elementos del DOM para la cámara y canvas
const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// Elementos de interfaz para gestos y selección
const cursor = document.getElementById("gestureCursor");
const instructionOverlay = document.getElementById("instructionOverlay");
const readyBtn = document.getElementById("readyBtn");
const exerciseGrid = document.getElementById("exerciseGrid");

// Elementos de la tarjeta de instrucción
const exerciseTitle = document.getElementById("exerciseTitle");
const exerciseImage = document.getElementById("exerciseImage");
const exerciseText = document.getElementById("exerciseText");

// Temporizadores y contadores
const countdown = document.getElementById("countdown");
const timerDisplay = document.getElementById("timer");

let currentExercise = null;
let readyHoverTime = 0;

// Ejercicios por defecto (fallback si no hay datos en localStorage)
const defaultExercises = {
  squat: {
    name: "Sentadillas",
    img: "assets/squat.jpg",
    desc: "Baja la cadera manteniendo espalda recta"
  },
  arms: {
    name: "Brazos",
    img: "assets/arms.jpg",
    desc: "Levanta ambos brazos"
  },
  knees: {
    name: "Rodillas",
    img: "assets/knees.jpg",
    desc: "Sube rodillas alternadamente"
  },
  side: {
    name: "Lateral",
    img: "assets/side.jpg",
    desc: "Inclina el torso a los lados"
  }
};

// Cargar ejercicios personalizados desde el administrador
let savedExercises = JSON.parse(localStorage.getItem("exercises")) || {};

// Combinar ejercicios por defecto con los del administrador
let exercises = {
  ...defaultExercises,
  ...savedExercises
};

// Renderizar el menú de ejercicios en la interfaz
function renderExercises() {
  exerciseGrid.innerHTML = "";
  
  Object.keys(exercises).forEach(key => {
    const ex = exercises[key];
    
    const div = document.createElement("div");
    div.classList.add("menu-option");
    div.dataset.ex = key;
    
    div.innerHTML = `
      <img src="${ex.img}" alt="${ex.name}">
      <p>${ex.name}</p>
    `;
    
    exerciseGrid.appendChild(div);
  });
}

renderExercises();

// Obtener todas las opciones del menú (ejercicios)
function getOptions() {
  return document.querySelectorAll(".menu-option");
}

// Mapa para almacenar tiempos de hover por cada ejercicio
let hoverTimerMap = new Map();

// Función principal de navegación por gestos usando landmarks de MediaPipe
function gestureNavigation(landmarks) {
  // Usar el punto 20 (muñeca) para posicionar el cursor
  const hand = landmarks[20];
  
  const x = hand.x * window.innerWidth;
  const y = hand.y * window.innerHeight;
  
  // Mover el cursor visual
  cursor.style.left = x + "px";
  cursor.style.top = y + "px";
  
  // Detectar hover sobre cada ejercicio del menú
  getOptions().forEach(option => {
    const rect = option.getBoundingClientRect();
    const inside = (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom);
    
    if (inside) {
      // Inicializar contador si no existe
      if (!hoverTimerMap.has(option)) {
        hoverTimerMap.set(option, 0);
      }
      
      let time = hoverTimerMap.get(option);
      time++;
      hoverTimerMap.set(option, time);
      
      // Aplicar efectos visuales de hover activo
      option.classList.add("active");
      cursor.style.transform = "scale(1.4)";
      
      // Mostrar barra de progreso del hover (60 frames = 2 segundos aprox)
      let percent = Math.min((time / 60) * 100, 100);
      option.style.backgroundSize = percent + "% 4px";
      
      // Si se completa el tiempo de hover, seleccionar el ejercicio
      if (time > 60) {
        showInstructions(option.dataset.ex);
        hoverTimerMap.set(option, 0);
        option.style.backgroundSize = "0% 4px";
      }
    } else {
      // Reiniciar contador si el cursor sale del área
      option.classList.remove("active");
      hoverTimerMap.set(option, 0);
      option.style.backgroundSize = "0% 4px";
    }
  });
  
  // Detectar hover sobre el botón "LISTO" cuando el overlay está visible
  if (instructionOverlay.style.display === "flex") {
    const rect = readyBtn.getBoundingClientRect();
    const inside = (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom);
    
    if (inside) {
      readyHoverTime++;
      readyBtn.classList.add("active");
      cursor.style.transform = "scale(1.4)";
      
      let percent = Math.min((readyHoverTime / 60) * 100, 100);
      readyBtn.style.backgroundSize = percent + "% 4px";
      
      if (readyHoverTime > 60) {
        readyBtn.click();
        readyHoverTime = 0;
        readyBtn.style.backgroundSize = "0% 4px";
      }
    } else {
      readyHoverTime = 0;
      readyBtn.classList.remove("active");
      readyBtn.style.backgroundSize = "0% 4px";
    }
  }
}

// Mostrar overlay de instrucciones del ejercicio seleccionado
function showInstructions(ex) {
  currentExercise = ex;
  const exercise = exercises[ex];
  
  exerciseTitle.innerText = exercise.name;
  exerciseImage.src = exercise.img;
  exerciseText.innerText = exercise.desc;
  
  instructionOverlay.style.display = "flex";
}

// Evento para iniciar el ejercicio al hacer clic en "LISTO"
readyBtn.addEventListener("click", () => {
  instructionOverlay.style.display = "none";
  
  // Mostrar overlay de ejercicio en curso
  document.getElementById("exerciseOverlay").style.display = "block";
  
  // Iniciar cuenta regresiva de 3 segundos
  let countdownTime = 3;
  countdown.style.display = "block";
  countdown.innerText = countdownTime;
  
  const countdownInterval = setInterval(() => {
    countdownTime--;
    countdown.innerText = countdownTime;
    
    if (countdownTime <= 0) {
      clearInterval(countdownInterval);
      countdown.style.display = "none";
      startTimer();
    }
  }, 1000);
});

// Iniciar temporizador del ejercicio (duración fija de 20 segundos)
function startTimer() {
  let time = 20;
  timerDisplay.innerText = time;
  
  const timerInterval = setInterval(() => {
    time--;
    timerDisplay.innerText = time;
    
    if (time <= 0) {
      clearInterval(timerInterval);
      endExercise();
    }
  }, 1000);
}

// Finalizar ejercicio, otorgar puntos al usuario y actualizar localStorage
function endExercise() {
  document.getElementById("exerciseOverlay").style.display = "none";
  
  const exercise = exercises[currentExercise];
  const earnedPoints = exercise.points || 0;
  
  let user = JSON.parse(localStorage.getItem("user")) || { points: 0 };
  user.points = (user.points || 0) + earnedPoints;
  
  localStorage.setItem("user", JSON.stringify(user));
  
  alert("Ejercicio terminado. Ganaste " + earnedPoints + " puntos");
  loadUserPoints();
}

// Cargar y mostrar los puntos del usuario actual
function loadUserPoints() {
  let user = JSON.parse(localStorage.getItem("user")) || { points: 0 };
  document.getElementById("userPoints").innerText = "Puntos: " + user.points;
}

loadUserPoints();

// Configuración de MediaPipe Pose
const pose = new Pose({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});

pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Callback cuando MediaPipe detecta resultados
pose.onResults(onResults);

// Función que procesa cada frame de la cámara
function onResults(results) {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  
  if (results.poseLandmarks) {
    gestureNavigation(results.poseLandmarks);
  }
}

// Inicializar la cámara
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 1280,
  height: 720
});

camera.start();