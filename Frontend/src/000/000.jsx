// Llamado a React y otras dependencias necesarias para la aplicación
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './000.css';

// Nombre de la función principal que define de página de inicio en el main.jsx
function Bienvenido() {
  useEffect(() => {
    document.title = "Bienvenido";
  }, []);

  // Retorno del JSX que define la estructura visual de la página de inicio en el main.jsx
  return (
  <div className="bienvenido-page">
    <div>
     
      {/* Círculo de fondo */}
      <div className="circuloFondo">

        {/* Logo */}
        <div className="logo-container">
          <img src="/fotos/LOGO MEL.png" alt="Logo" />
        </div>

        {/* Título y botones principales */}
        <div className="title">
         <h1>¡BIENVENIDO!</h1>
        </div>
        
        <div className="buttons">
          <Link to="/001" className="btnInicioSesion">INICIAR SESIÓN</Link>
          <Link to="/004" className="btnRegistrarse">REGISTRARSE</Link>
        </div>
      


        {/* Botones inferiores */}
        <Link to="/003" className="btnDudas">?</Link>
        <Link to="/004" className="btnReporte">!</Link>

      

        {/* circulos decorativos*/}
          <div className="cGDecor-1"></div>
          <div className="cGDecor-2"></div>
          <div className="cGDecor-3"></div>

</div>
    </div>
  </div>
  );
}

export default Bienvenido;
