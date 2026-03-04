// ==============================
// IMPORTACIONES
// ==============================

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./001.css";

// Íconos
import ojoAbierto from "/fotos/ojo abierto.png";
import ojoCerrado from "/fotos/ojo cerrado.png";
import keyIcon from "/fotos/key-icon.png";
import emailIcon from "/fotos/email-icon.png";


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
    correo: "",
    password: "",
  });

  // Cambia el título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Login";
  }, []);

  // ============================================================
  // Maneja los cambios en los inputs (correo y contraseña)
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
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos vacíos
    if (
      formData.correo.trim() === "" ||
      formData.password.trim() === ""
    ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Validar longitud mínima de contraseña
    if (formData.password.length < 8) {
      alert("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    // Si todo está correcto, redirige al dashboard
    navigate("/100");
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
        <div className="titulo">
          <h2>INICIA SESIÓN</h2>
        </div>

        {/* Contenedor principal del login */}
        <div className="login-container">

          <form onSubmit={handleSubmit}>

            {/* Campo correo */}
            <div className="input-group">
              <img src={emailIcon} alt="Correo" className="email" />
              <input
                type="email"
                name="correo"
                placeholder="CORREO@ELECTRONICO.COM"
                value={formData.correo}
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
            <Link to="/004">ÚNETE AQUÍ</Link>
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

export default Login;
