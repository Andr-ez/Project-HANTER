// IMPORTACIONES
import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./005.css";

function SeleccionCodigoSeguridad() {

  useEffect(() => {
    document.title = "CÓDIGO DE SEGURIDAD";
  }, []);

  return (
    <div className="codigo-page">

      {/* Flecha regresar */}
      <Link to="/002" className="back-btn" aria-label="Regresar">
        &lt;
      </Link>

      {/* Fondo */}
      <div className="circuloFondo"></div>

      {/* Decoraciones */}
      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>
      <div className="cGDecor-3"></div>
      <div className="cADecor-1"></div>

      {/* Contenido */}
      <div className="principal-container">

        <h2>
          CÓDIGO DE <br /> SEGURIDAD
        </h2>

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

// Exportación del componente para poder usarlo en main.jsx
export default SeleccionCodigoSeguridad;
