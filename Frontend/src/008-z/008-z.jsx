// ==============================
// IMPORTACIONES
// ==============================

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './008-z.css';


// ============================================================
// COMPONENTE CONFIRMACIÓN CALIFICACIÓN
// ============================================================

function CalificacionGuardada() {

  // Cambia el título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Calificación Guardada";
  }, []);


  // ============================================================
  // ESTRUCTURA VISUAL (JSX)
  // ============================================================
  return (
    <div className="confirmacion-page">
      <div className="circuloFondo">

        {/* Botón regresar */}
        <Link to="/008" className="back-btn">
          ←
        </Link>

        {/* Título principal */}
        <div className="title">
          <h1>SOPORTE TÉCNICO</h1>
        </div>

        {/* Contenedor de confirmación */}
        <div className="confirmacion-contenedor">

          {/* Ícono de éxito */}
          <div className="confirmacion-icono">✓</div>

          {/* Mensaje principal */}
          <p className="confirmacion-titulo">
            ¡CALIFICACIÓN<br />GUARDADA!
          </p>

          {/* Mensaje secundario */}
          <p className="confirmacion-mensaje">
            TU CALIFICACIÓN FUE<br />CORRECTAMENTE GUARDADA
          </p>

          {/* Botón volver al inicio */}
          <Link to="/001" className="btn-inicio">
            VOLVER AL INICIO
          </Link>

        </div>

        {/* Elementos decorativos */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>

      </div>
    </div>
  );
}

// Exportación del componente para poder usarlo en main.jsx
export default CalificacionGuardada;
