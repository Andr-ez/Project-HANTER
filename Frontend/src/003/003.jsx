import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./003.css";

function NuevaContrasena() {
  useEffect(() => {
    document.title = "Nueva Contraseña";
  }, []);

  return (
    <div className="nueva-contrasena-page">
      <div className="circuloFondo">

        {/* Flecha Regresar */}
        <Link to="/" className="back-btn">
          ←
        </Link>

        {/* Título */}
        <div className="titulo">
          <h2>CREA UNA NUEVA</h2>
          <h2>CONTRASEÑA</h2>
        </div>

        {/* Contenedor */}
        <div className="login-container">

          {/* Nueva contraseña */}
          <div className="input-group">
            <input
              type="password"
              placeholder="NUEVA CONTRASEÑA"
              required
            />
          </div>

          {/* Verificar contraseña */}
          <div className="input-group">
            <input
              type="password"
              placeholder="VERIFICA"
              required
            />
          </div>

          {/* Botón cambiar contraseña */}
          <Link to="/001" className="btn-login">
            CAMBIAR CONTRASEÑA
          </Link>

        </div>

        {/* Decoraciones */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>
        <div className="cADecor-1"></div>

      </div>
    </div>
  );
}

export default NuevaContrasena;
