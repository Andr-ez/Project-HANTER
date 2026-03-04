// Importación de hooks y componentes necesarios
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './000.css'; // Estilos de la página

// ============================================================
// Componente principal de la página de Bienvenida
// ============================================================
function Bienvenido() {

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
          <Link to="/003" className="btnDudas">?</Link>
          <Link to="/004" className="btnReporte">!</Link>

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
