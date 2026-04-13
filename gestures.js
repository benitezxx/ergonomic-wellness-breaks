// Variables de control para detección de hover y swipe
let hoverStart = null;
let lastX = null;

// Detecta hover sostenido sobre elementos .menu-item
function detectHover(handLandmarks) {
  const indexFinger = handLandmarks[8]; // Punta del dedo índice
  
  const screenX = indexFinger.x * window.innerWidth;
  const screenY = indexFinger.y * window.innerHeight;
  
  document.querySelectorAll('.menu-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    
    if (screenX > rect.left && screenX < rect.right && screenY > rect.top && screenY < rect.bottom) {
      if (!hoverStart) hoverStart = Date.now();
      
      // Si el hover dura más de 2 segundos, ejecuta el click
      if (Date.now() - hoverStart > 2000) {
        item.click();
        hoverStart = null;
      }
      
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Detecta gesto de swipe horizontal para cambiar de ejercicio
function detectSwipe(handLandmarks) {
  const wrist = handLandmarks[0]; // Muñeca
  const currentX = wrist.x;
  
  if (lastX) {
    // Swipe hacia la derecha
    if (currentX - lastX > 0.15) {
      nextExercise();
    } 
    // Swipe hacia la izquierda
    else if (lastX - currentX > 0.15) {
      previousExercise();
    }
  }
  
  lastX = currentX;
}
