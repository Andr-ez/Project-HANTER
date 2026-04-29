//llamado de React y otras dependencias necesarias para la aplicación
import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./100.css";

//Nombre de la función que define el componente en el main.jsx
function Inicio() {

  useEffect(() => {
    document.title = "INICIO";
  }, []);

  return (

  <div className="inicio-page">
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

      {/* Contenedor principal */}
      <div className="menu-container">

        <h1>INICIO</h1>

        <button className="menu-btn">
          CERTIFICADOS
        </button>

        <button className="menu-btn">
          NÓMINA
        </button>

        <button className="menu-btn">
          CAPACITACIONES
        </button>

        <button className="menu-btn">
          BENEFICIOS
        </button>

      </div>

    </div>
  </div>

  );
}

// Exportación del componente para poder usarlo en main.jsx
export default Inicio;
