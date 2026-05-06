// ==============================
// IMPORTACIONES
// ==============================

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './011.css';


const YOUTUBE_VIDEO_ID = 'dQw4w9WgXcQ';


// ============================================================
// COMPONENTE VIDEO DUDAS E INQUIETUDES
// ============================================================

function VideoSolucion() {

  // Cambia el título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Dudas e Inquietudes — Video";
  }, []);


  // ============================================================
  // ESTRUCTURA VISUAL (JSX)
  // ============================================================
  return (
    <div className="video-page">
      <div className="circuloFondo">

        {/* Botón regresar */}
        <Link to="/010" className="back-btn">
          ←
        </Link>

        {/* Título principal */}
        <div className="title">
          <h1>DUDAS E<br />INQUIETUDES</h1>
        </div>

        {/* Subtítulo */}
        <p className="video-subtitulo">
          VIDEO DE YOUTUBE<br />
          SOLUCIONANDO EL PROBLEMA...
        </p>

        {/* Contenedor del video */}
        <div className="video-wrapper">
          <iframe
            className="video-iframe"
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
            title="Video solución"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
export default VideoSolucion;
