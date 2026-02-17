//llamado de React y otras dependencias necesarias para la aplicación
import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./004.css";

//Nombre de la función que define el componente en el main.jsx
function Registro() {

  useEffect(() => {
    document.title = "REGÍSTRATE";
  }, []);

  return (

    <div className="registro-page">
      <div>

        {/* Flecha Regresar */}
        <Link to="/" className="back-btn" aria-label="Regresar">
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

          <h2>REGÍSTRATE</h2>

          <div className="input-group">
            <span>👤</span>
            <input type="text" placeholder="NOMBRES Y APELLIDOS" required />
          </div>

          <div className="input-group">
            <span>🪪</span>
            <input type="text" placeholder="NÚMERO DE IDENTIFICACIÓN" required />
          </div>

          <div className="input-group">
            <span>📅</span>
            <label className="info-text">FECHA DE NACIMIENTO</label>
            <input type="date" />
          </div>

          <div className="input-group">
            <span>✉️</span>
            <input type="email" placeholder="CORREO ELECTRÓNICO" required />
          </div>

          <div className="input-group">
            <span>📱</span>
            <input type="tel" placeholder="NÚMERO DE CONTACTO" required />
          </div>

          <div className="input-group">
            <span>🔑</span>
            <input type="password" placeholder="CREA UNA CONTRASEÑA" required />
          </div>

          <div className="input-group">
            <span>🔑</span>
            <input type="password" placeholder="CONFIRMA TU CONTRASEÑA" required />
          </div>

          <button className="btnCambio">
            CREAR CUENTA
          </button>

        </div>

      </div>
    </div>

  );
}

export default Registro;
