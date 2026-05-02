// Importación de hooks y componentes necesarios
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './000.css'; // Estilos de la página


// ============================================================
// Componente principal de la página de Bienvenida
// ============================================================
function Bienvenido() {

  // Estado para controlar la visibilidad del aviso
  const [mostrarAviso, setMostrarAviso] = useState(true);

  // ============================================================
  // Cambia el título de la pestaña cuando el componente se monta
  // ============================================================
  useEffect(() => {
    document.title = "Bienvenido";
  }, []);

  // ============================================================
  // Estructura visual (JSX) de la página
  // ============================================================
  return (
    <div className="bienvenido-page">

      {/* ======================================================
          MODAL — AVISO DE DESARROLLO ACADÉMICO
      ====================================================== */}
      {mostrarAviso && (
        <>
          {/* Fondo oscuro detrás del modal */}
          <div className="aviso-overlay" onClick={() => setMostrarAviso(false)} />

          <div className="aviso-modal">

            {/* Encabezado del modal */}
            <div className="aviso-header">
              <span className="aviso-icono">⚠️</span>
              <h2 className="aviso-titulo">AVISO IMPORTANTE</h2>
            </div>

            {/* Cuerpo del texto */}
            <div className="aviso-cuerpo">
              <p>
                El contenido presentado en esta página se encuentra actualmente en
                proceso de producción y desarrollo. Todos los archivos, imágenes,
                textos y elementos expuestos dentro del sistema son meramente
                ejemplificativos y no representan información definitiva. Cualquier
                parecido con la realidad es pura coincidencia.
              </p>
              <p>
                Este proyecto corresponde a un trabajo académico desarrollado para
                la empresa ficticia <strong>HANTER</strong>, dentro del área de
                Análisis y Desarrollo de Software del <strong>SENA</strong>.
              </p>
              <p>El desarrollo, diseño y contenido de este sistema han sido realizados por:</p>
              <ul className="aviso-lista">
                <li>Jaime Antonio Marín Barrientos</li>
                <li>Jorge Andrés Velásquez</li>
                <li>Rosa Elizabeth Castillo</li>
              </ul>
              <p>
                La información contenida puede estar sujeta a cambios, ajustes o
                actualizaciones sin previo aviso, en función del avance del proyecto
                y de los requerimientos académicos. El uso y revisión de este material
                debe entenderse dentro del contexto formativo para el cual fue creado.
              </p>
            </div>

            {/* Botón para cerrar */}
            <button
              className="aviso-btn-cerrar"
              onClick={() => setMostrarAviso(false)}
            >
              ENTENDIDO
            </button>

          </div>
        </>
      )}

      <div>

        {/* Círculo de fondo principal */}
        <div className="circuloFondo">

          {/* Logo de la aplicación */}
          <div className="logo-container">
            <img src="/fotos/LOGO MEL.png" alt="Logo" />
          </div>

          {/* Título principal */}
          <div className="title">
            <h1>¡BIENVENIDO!</h1>
          </div>

          {/* Botones principales de navegación */}
          <div className="buttons">
            <Link to="/001" className="btnInicioSesion">
              INICIAR SESIÓN
            </Link>
            <Link to="/004" className="btnRegistrarse">
              REGISTRARSE
            </Link>
          </div>

          {/* Botones secundarios */}
          <Link to="/010" className="btnDudas">?</Link>
          <Link to="/007" className="btnReporte">!</Link>

          {/* Elementos decorativos */}
          <div className="cGDecor-1"></div>
          <div className="cGDecor-2"></div>
          <div className="cGDecor-3"></div>

        </div>
      </div>
    </div>
  );
}

// Exportación del componente para poder usarlo en main.jsx
export default Bienvenido;
