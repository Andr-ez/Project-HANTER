//llamado de React y otras dependencias necesarias para la aplicación
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import "./001.css";

//Nombre de la función que define el componente de login en el main.jsx
function Login() {
  useEffect(() => {
    document.title = "Login";
    }, []);

    // Retorno del JSX que define la estructura visual de la pagina de login en el main.jsx
    return (
    <div className="login-page">

      {/* Flecha Regresar */}
      <Link to="/" className="back-btn" aria-label="Regresar">
        &lt;
      </Link>
      {/* Fondo */}
      <div className="circuloFondo"></div>
      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>
      <div className="cGDecor-3"></div>
      <div className="cADecor-1"></div>

      {/* Contenedor del Login */}
      <div className="login-container">
        <h2>INICIA SESIÓN</h2>

        {/* Campos de correo y contraseña */}
        <div className="input-group">
          <span>📧</span>
          <input
            type="email"
            placeholder="CORREO@ELECTRONICO.COM"
            required
          />
        </div>

        <div className="input-group">
          <span>🔑</span>
          <input
            type="password"
            placeholder="CONTRASEÑA"
            required
          />
        </div>

        {/* Botón de recuperacion de contrasena */}
        <Link to="/002" className="olvido">
          ¿OLVIDASTE TU CONTRASEÑA?
        </Link>

          {/* Botón de inicio de sesión */}
        <Link to="/100" className="btn-login">
          INICIAR SESIÓN
        </Link>

        {/* Botón de registro */}
        <p className="registro">
          ¿AÚN NO TIENES CUENTA? <a href="#">ÚNETE AQUÍ</a>
        </p>
      </div>

    </div>
   
  );
}

export default Login;
