// ============================================================
// IMPORTACIONES
// ============================================================

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./004.css";

// Importación de íconos
import userIcon from "/fotos/icon/user-icon.png";
import emailIcon from "/fotos/icon/email-icon.png";
import keyIcon from "/fotos/icon/key-icon.png";
import ojoAbierto from "/fotos/icon/ojo abierto.png";
import ojoCerrado from "/fotos/icon/ojo cerrado.png";


// ============================================================
// COMPONENTE REGISTRO
// ============================================================

function Registro() {

  const navigate = useNavigate();

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cuentaCreada, setCuentaCreada] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.title = "Registro";
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==============================
  // FUNCIÓN DE ENVÍO DEL FORMULARIO
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos vacíos
    for (let key in formData) {
      if (formData[key].trim() === "") {
        alert("Todos los campos son obligatorios");
        return;
      }
    }

    // Validar longitud contraseña
    if (formData.password.length < 4) {
      alert("La contraseña debe tener mínimo 4 caracteres");
      return;
    }

    // Validar coincidencia contraseña
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/usuarios/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          correo: formData.correo,
          nombre_usuario: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Usuario registrado:", data);

        // Mostrar pantalla de éxito
        setCuentaCreada(true);         

      } else {
        alert(data.mensaje || "Error al registrar usuario");
      }

    } catch (error) {
      console.error("Error en registro:", error);
      alert("No se pudo conectar con el servidor");
    }
  };


  // ==============================
  // PANTALLA DE ÉXITO
  // ==============================

  if (cuentaCreada) {
    return (
      <div className="registro-page">

        <Link to="/" className="back-btn">&lt;</Link>

        <div className="circuloFondo"></div>

        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>
        <div className="cADecor-1"></div>

        <div className="principal-container">
          <h2>CÓDIGO DE <br /> SEGURIDAD</h2>

          <label className="info-text">
            SELECCIONA LA VÍA POR LA QUE TE ENVIAREMOS UN CÓDIGO DE SEGURIDAD
          </label>

          <Link to="/004" className="btnMetodo">
            MENSAJE DE TEXTO
          </Link>

          <Link to="/004" className="btnMetodo">
            CORREO ELECTRONICO
          </Link>
        </div>
      </div>
    );
  }

  // ==============================
  // FORMULARIO PRINCIPAL
  // ==============================

  return (
    <div className="registro-page">
      <div className="circuloFondo">

        <Link to="/" className="back-btn">←</Link>

        <div className="title">
          <h2>REGÍSTRATE</h2>
        </div>

        <div className="principal-container">

          <form onSubmit={handleSubmit}>

            <div className="input-group">
              <img src={userIcon} alt="Usuario" />
              <input
                type="text"
                name="nombre"
                placeholder="NOMBRE COMPLETO"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <img src={userIcon} alt="Usuario" />
              <input
                type="text"
                name="username"
                placeholder="NOMBRE DE USUARIO"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <img src={emailIcon} alt="Correo" />
              <input
                type="email"
                name="correo"
                placeholder="CORREO@ELECTRONICO.COM"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group password-group">
              <img src={keyIcon} alt="Contraseña" />
              <input
                type={mostrarPassword ? "text" : "password"}
                name="password"
                placeholder="CONTRASEÑA"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <img
                src={mostrarPassword ? ojoCerrado : ojoAbierto}
                alt="Mostrar contraseña"
                className="eye-icon"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              />
            </div>

            <div className="input-group password-group">
              <img src={keyIcon} alt="Confirmar contraseña" />
              <input
                type={mostrarPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="CONFIRMAR CONTRASEÑA"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <img
                src={mostrarPassword ? ojoCerrado : ojoAbierto}
                alt="Mostrar contraseña"
                className="eye-icon"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              />
            </div>

            <button type="submit" className="btnRegistro">
              CREAR CUENTA
            </button>

          </form>

          <p className="registro-link">
            ¿YA TIENES CUENTA? <Link to="/001">INICIA SESIÓN</Link>
          </p>

        </div>

        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>
        <div className="cADecor-1"></div>
      </div>
    </div>
  );
}

// Exportación del componente para poder usarlo en main.jsx
export default Registro;