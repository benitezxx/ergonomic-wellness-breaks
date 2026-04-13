// Cargar ejercicios desde localStorage, o inicializar como objeto vacío
let exercises = JSON.parse(localStorage.getItem("exercises")) || {};

// Función para renderizar la lista de ejercicios en el panel de administración
function render() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  // Recorrer cada ejercicio almacenado
  Object.keys(exercises).forEach(key => {
    const ex = exercises[key];
    
    // Crear elemento visual para cada ejercicio
    const div = document.createElement("div");
    div.classList.add("exercise-item");
    
    div.innerHTML = `
      <img src="${ex.img}" alt="${ex.name}">
      <h4>${ex.name}</h4>
      <p>${ex.desc}</p>
      <p>${ex.points || 0} puntos</p>
      <button class="delete-btn" onclick="removeEx('${key}')">Eliminar</button>
    `;
    
    list.appendChild(div);
  });
}

// Agregar un nuevo ejercicio al sistema
function addExercise() {
  // Obtener valores del formulario
  const name = document.getElementById("name").value;
  const desc = document.getElementById("desc").value;
  const img = document.getElementById("img").value;
  const points = parseInt(document.getElementById("points").value) || 0;
  
  // Generar una clave única a partir del nombre (minúsculas, sin espacios)
  const key = name.toLowerCase().replace(/\s/g, '');
  
  // Almacenar el ejercicio en el objeto
  exercises[key] = {
    name,
    desc,
    img,
    points
  };
  
  // Guardar en localStorage
  localStorage.setItem("exercises", JSON.stringify(exercises));
  
  // Actualizar la interfaz
  render();
}

// Eliminar un ejercicio por su clave
function removeEx(key) {
  delete exercises[key];
  localStorage.setItem("exercises", JSON.stringify(exercises));
  render();
}

// Cargar estadísticas de usuarios: total, puntos acumulados y usuario con más puntos
function loadStats() {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  
  // Total de usuarios registrados
  document.getElementById("totalUsers").innerText = users.length;
  
  // Suma total de puntos de todos los usuarios
  let totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0);
  document.getElementById("totalPoints").innerText = totalPoints;
  
  // Determinar el usuario con mayor puntuación
  if (users.length > 0) {
    users.sort((a, b) => b.points - a.points);
    document.getElementById("topUser").innerText = 
      users[0].name + " (" + users[0].points + ")";
  }
}

// Ejecutar renderizado inicial y carga de estadísticas
render();
loadStats();