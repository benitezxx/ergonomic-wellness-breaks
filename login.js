// Función para iniciar sesión como usuario (simulación de reconocimiento facial)
function loginUser() {
  // Crear objeto de usuario demo
  const user = {
    id: "user001",
    name: "Usuario Demo",
    points: 100
  };
  
  // Guardar rol y datos del usuario en localStorage
  localStorage.setItem("role", "user");
  localStorage.setItem("user", JSON.stringify(user));
  
  // Redirigir al panel de usuario (ejercicios)
  window.location.href = "index.html";
}

// Función para iniciar sesión como administrador con credenciales fijas
function loginAdmin() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;
  
  // Credenciales predefinidas (admin / 1234)
  if (user === "admin" && pass === "1234") {
    localStorage.setItem("role", "admin");
    window.location.href = "admin.html";
  } else {
    alert("Credenciales incorrectas");
  }
}