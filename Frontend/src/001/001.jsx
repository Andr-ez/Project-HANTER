// ==============================
// IMPORTACIONES
// ==============================

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./001.css";

// Íconos
import ojoAbierto from "/fotos/icon/ojo abierto.png";
import ojoCerrado from "/fotos/icon/ojo cerrado.png";
import keyIcon from "/fotos/icon/key-icon.png";
import userIcon from "/fotos/icon/user-icon.png";


// ============================================================
// COMPONENTE LOGIN
// ============================================================

function Login() {

  // Hook para redireccionar a otra página
  const navigate = useNavigate();

  // Estado para mostrar/ocultar contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // ============================================================
  // Estado que almacena los datos del formulario
  // ============================================================
  const [formData, setFormData] = useState({
    usuario: "",
    password: "",
  });

  // Cambia el título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Login";
    localStorage.removeItem("token"); // Eliminar token al cargar la página de login
  }, []);

  // ============================================================
  // Maneja los cambios en los inputs (usuario y contraseña)
  // ============================================================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================================================
  // Maneja el envío del formulario y validaciones
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos vacíos
    if (
      formData.usuario.trim() === "" ||
      formData.password.trim() === ""
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

     // Validar longitud mínima de contraseña
    if (formData.password.length < 4) {
      alert("La contraseña debe tener mínimo 4 caracteres");
      return;
    }

    // Intento de conexión al servidor
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          nombre_usuario: formData.usuario, 
          password: formData.password 
        }),
      });

      // Procesar la respuesta
      const data = await response.json();

      if (response.ok && data.token) {
        // Guardar token y redirigir
        localStorage.setItem("token", data.token);
        console.log("Login exitoso");
        navigate("/100");
      } else {
        alert(data.mensaje || "Credenciales inválidas");
      }

    } catch (error) {
      console.error("Error en la conexión:", error);
      alert("No se pudo conectar con el servidor. Inténtalo más tarde.");
    }

  };


  // ============================================================
  // ESTRUCTURA VISUAL (JSX)
  // ============================================================
  return (
    <div className="login-page">
      <div className="circuloFondo">

        {/* Botón regresar */}
        <Link to="/" className="back-btn">
          ←
        </Link>

        {/* Título */}
        <div className="title">
          <h2>INICIA SESIÓN</h2>
        </div>

        {/* Contenedor principal del login */}
        <div className="login-container">

          <form onSubmit={handleSubmit}>

            {/* Campo identificador */}
            <div className="input-group">
              <img src={userIcon} alt="Usuario" className="user" />
              <input
                type="text"
                name="usuario"
                placeholder="CORREO O NOMBRE DE USUARIO"
                value={formData.usuario}
                onChange={handleChange}
                required
              />
            </div>

            {/* Campo contraseña */}
            <div className="input-group password-group">
              <img src={keyIcon} alt="Contraseña" className="key" />

              <input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                placeholder="CONTRASEÑA"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {/* Ícono para mostrar/ocultar contraseña */}
              <img
                src={mostrarPassword ? ojoCerrado : ojoAbierto}
                alt="Mostrar contraseña"
                className="eye-icon"
                onClick={() =>
                  setMostrarPassword(!mostrarPassword)
                }
              />
            </div>

            {/* Enlace recuperar contraseña */}
            <Link to="/002" className="olvido">
              ¿OLVIDASTE TU CONTRASEÑA?
            </Link>

            <br />

            {/* Botón enviar */}
            <button type="submit" className="btn-login">
              INICIAR SESIÓN
            </button>

          </form>

          <br />

          {/* Enlace a registro */}
          <p className="registro">
            ¿AÚN NO TIENES CUENTA?{" "}
            <Link to="/004">→    ÚNETE AQUÍ   ←</Link>
          </p>

        </div>

        {/* Elementos decorativos */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>
        <div className="cADecor-1"></div>

      </div>
    </div>
  );
}

// Exportación del componente para poder usarlo en main.jsx
export default Login;