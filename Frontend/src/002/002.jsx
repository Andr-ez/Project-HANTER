//llamado de React y otras dependencias necesarias para la aplicación
import { useEffect } from "react";
import { Link } from 'react-router-dom';
import "./002.css";
import emailIcon from "/fotos/email-icon.png";

//Nombre de la función que define el componente de RecuperarContrasena en el main.jsx
function RecuperarContrasena() {

  useEffect(() => {
    document.title = "RECUPERAR CONTRASEÑA";
  }, []);

  return (

  <div className="recuperar-page">
    <div>

      {/* Flecha Regresar */}
      <Link to="/001" className="back-btn" aria-label="Regresar">
        &lt;
      </Link>

      {/* Fondo */}
      <div className="circuloFondo"></div>
      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>
      <div className="cGDecor-3"></div>
      <div className="cADecor-1"></div>

      {/* Contenedor */}
      <div className="principal-container">
        <h2>RECUPERAR CONTRASEÑA</h2>

        <label className="info-text">
          INGRESA TU CORREO PARA RECUPERAR TU CONTRASEÑA
        </label>

        <div className="input-group">
          <img src={emailIcon} alt="Correo" className="email" />
          <input
            type="email"
            placeholder="CORREO@ELECTRONICO.COM"
            required
          />
        </div>

        <button className="btnEnviarCodigo">
          ENVIAR CODIGO
        </button>

        <br />
        {/* Segunda parte del proceso de recuperación de contraseña-ingreso del codigo */}
        <label className="label segunda">
          INGRESA EL CÓDIGO DE VERIFICACIÓN
        </label>

        <div className="codigo-campos">
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
        </div>

        <Link to="/003" className="btnVerificacion">
          VERIFICAR CÓDIGO
        </Link>
      </div>

    </div>
  </div>
  );
}

export default RecuperarContrasena;
