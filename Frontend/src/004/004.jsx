// ============================================================
// IMPORTACIONES
// ============================================================

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./004.css";

// Importación de íconos
import userIcon from "/fotos/user-icon.png";
import emailIcon from "/fotos/email-icon.png";
import keyIcon from "/fotos/key-icon.png";
import dniIcon from "/fotos/dni-icon.png";
import weekIcon from "/fotos/week-icon.png";
import phoneIcon from "/fotos/phone-icon.png";
import ojoAbierto from "/fotos/ojo abierto.png";
import ojoCerrado from "/fotos/ojo cerrado.png";



// ============================================================
// COMPONENTE REGISTRO
// ============================================================

function Registro() {

  // Hook para redireccionar a diferentes rutas como el inicio de sesión si el usuario ya tiene cuenta
  const navigate = useNavigate();

   // Estado para mostrar u ocultar la contraseña
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estado para saber si la cuenta fue creada correctamente
  const [cuentaCreada, setCuentaCreada] = useState(false);

  // Estado que almacena todos los datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    fechaNacimiento: "",
    correo: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });


  //Titulo de la página
  useEffect(() => {
    document.title = "Registro";
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData, // mantiene los valores anteriores
      [e.target.name]: e.target.value,
    });
  };



  // ==============================
  // FUNCIÓN DE ENVÍO DEL FORMULARIO
  // ==============================

  const handleSubmit = (e) => {
    e.preventDefault(); // evita que la página se recargue


    // Validar campos vacíos
    for (let key in formData) {
      if (formData[key].trim() === "") {
        alert("Todos los campos son obligatorios");
        return;
      }
    }

    // Validar longitud contraseña
    if (formData.password.length < 8) {
      alert("La contraseña debe tener mínimo 8 caracteres");
      return;
    }

    // Validar coincidencia contraseña
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Si todo está correcto
    setCuentaCreada(true);
  };



  // ==============================
  // PANTALLA DE ÉXITO DE CREACIÓN DE CUENTA
  // ==============================

  // Si la cuenta fue creada, se renderiza este bloque
  if (cuentaCreada) {
    return (
      <div className="registro-page">
        <div className="circuloFondo">
          <div className="mensaje-exito">
            <h2>✅ Cuenta creada correctamente</h2>
            <button
              className="btnRegistro"
              onClick={() => navigate("/001")} // Redirige al login
            >
              CONTINUAR
            </button>
          </div>
        </div>
      </div>
    );
  }
  


  // ==============================
  // RENDER PRINCIPAL DEL FORMULARIO
  // ==============================

  return (
    <div className="registro-page">
      <div className="circuloFondo">

         {/* Botón para volver a la página principal */}
        <Link to="/" className="back-btn">←</Link>

        {/* Título del formulario */}
        <div className="titulo">
          <h2>REGÍSTRATE</h2>
        </div>

        <div className="principal-container">

          {/* Formulario principal */}
          <form onSubmit={handleSubmit}>

            {/* Nombre */}
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

            {/* DNI */}
            <div className="input-group">
              <img src={dniIcon} alt="DNI" />
              <input
                type="text"
                name="dni"
                placeholder="NUMERO Y TIPO DE IDENTIFICACION     (EJ: C.C. 12345678)"
                value={formData.dni}
                onChange={handleChange}
                required
              />
            </div>

            {/* Fecha nacimiento */}
            <div className="input-group">
              <img src={weekIcon} alt="Fecha nacimiento" />
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
              />
            </div>

            {/* Correo */}
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

            {/* Teléfono */}
            <div className="input-group">
              <img src={phoneIcon} alt="Teléfono" />
              <input
                type="tel"
                name="telefono"
                placeholder="NUMERO DE TELEFONO"
                maxLength="10"
                value={formData.telefono}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, "");
                  handleChange(e);
                }}
                required
              />
            </div>

            {/* Contraseña */}
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

            {/* Confirmar contraseña */}
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


            {/* Botón de envío */}
            <button type="submit" className="btnRegistro">
              CREAR CUENTA
            </button>

          </form>
          
          {/* Enlace para usuarios que ya tienen cuenta */}
          <p className="registro-link">
            ¿YA TIENES CUENTA? <Link to="/001">INICIA SESIÓN</Link>
          </p>

        </div>
      </div>

        {/* circulos decorativos*/}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>
        <div className="cADecor-1"></div>
    </div>
  );
}

// Exportación del componente
export default Registro;
