// ==============================
// IMPORTACIONES
// ==============================

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './010.css';


// ============================================================
// COMPONENTE DUDAS E INQUIETUDES
// ============================================================

function DudasInquietudes() {

  // Cambia el título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Dudas e Inquietudes";
  }, []);


  // ============================================================
  // ESTRUCTURA VISUAL (JSX)
  // ============================================================
  return (
    <div className="dudas-page">
      <div className="circuloFondo">

        {/* Botón regresar */}
        <Link to="/" className="back-btn">
          ←
        </Link>

        {/* Título principal */}
        <div className="title">
          <h1>DUDAS  E  INQUIETUDES</h1>
        </div>

        {/* Subtítulo */}
        <p className="dudas-subtitulo">
          SELECCIONE POR FAVOR LO QUE NECESITA...
        </p>

        {/* Etiqueta sección */}
        <p className="dudas-seccion">
          PREGUNTAS FRECUENTES
        </p>

        {/* Botones de preguntas frecuentes */}
        <div className="dudas-botones">

          <Link to="/010-A" className="btn-dudas">
            ¿CÓMO INICIO SESIÓN?
          </Link>

          <Link to="/010-B" className="btn-dudas">
            ¿CÓMO CAMBIO DE CONTRASEÑA?
          </Link>

          <Link to="/010-C" className="btn-dudas">
            NO ME LLEGA EL CODIGO DE VERIFICACIÓN
          </Link>

          <Link to="/010-D" className="btn-dudas">
            ¿CÓMO CAMBIO DE CORREO?
          </Link>

          <Link to="/200-B" className="btn-dudas">
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
export default DudasInquietudes;
