// ==============================
// IMPORTACIONES
// ==============================

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './007.css';


// ============================================================
// COMPONENTE SOPORTE TÉCNICO
// ============================================================

function SoporteTecnico() {

  // Cambia el título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Soporte Técnico";
  }, []);


  // ============================================================
  // ESTRUCTURA VISUAL (JSX)
  // ============================================================
  return (
    <div className="soporte-page">
      <div className="circuloFondo">

        {/* Botón regresar */}
        <Link to="/" className="back-btn">
          ←
        </Link>

        {/* Título principal */}
        <div className="title">
          <h1>SOPORTE<br />TÉCNICO</h1>
        </div>

        {/* Subtítulo */}
        <p className="soporte-subtitulo">
          SELECCIONE POR FAVOR LO QUE NECESITA...
        </p>

        {/* Botones de opciones */}
        <div className="soporte-botones">

          <Link to="/008" className="btn-soporte">
            CALIFICAR NUESTRO SISTEMA
          </Link>

          <Link to="/009" className="btn-soporte">
            PONERSE EN CONTACTO CON<br />NUESTROS ENCARGADOS
          </Link>

        </div>

        {/* Elementos decorativos */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>
        <div className="cGDecor-4"></div>

      </div>
    </div>
  );
}

// Exportación del componente para poder usarlo en main.jsx
export default SoporteTecnico;
