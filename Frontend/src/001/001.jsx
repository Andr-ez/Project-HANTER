//llamado de React y otras dependencias necesarias para la aplicación
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./001.css";
import ojoAbierto from "/fotos/ojo abierto.png";
import ojoCerrado from "/fotos/ojo cerrado.png";




//Nombre de la función que define el componente de login en el main.jsx
function Login() {
  const [mostrarPassword, setMostrarPassword] = useState(false);
  useEffect(() => {
    document.title = "Login";
    }, []);

    // Retorno del JSX que define la estructura visual de la pagina de login en el main.jsx
    return (
      <div className="login-page">
        <div className="circuloFondo">
         {/* Flecha Regresar */}
          <Link to="/" className="back-btn">
            ←
          </Link>
    
          {/* Título de la página */}
            <div className="titulo">
              <h2>INICIA SESIÓN</h2>
            </div>

          {/* Contenedor del Login */}
          <div className="login-container">

            {/* Campos de correo y contraseña */}
              <div className="input-group">
                <span>📧</span>
                <input
                  type="email"
                  placeholder="CORREO@ELECTRONICO.COM"
                  required
                />
              </div>

              <div className="input-group password-group">
                <span>🔑</span>

                <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="CONTRASEÑA"
                required
                />

              <img
                src={mostrarPassword ? ojoCerrado : ojoAbierto}
                alt="Mostrar contraseña"
                className="eye-icon"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              />
              </div>

            {/* Botón de recuperacion de contrasena */}
              <Link to="/002" className="olvido">
                ¿OLVIDASTE TU CONTRASEÑA?
              </Link>
              
              <br/>

            {/* Botón de inicio de sesión */}
              <Link to="/100" className="btn-login">
                INICIAR SESIÓN
              </Link>
            
            <br/>

            {/* Botón de registro */}
              <p className="registro">
                ¿AÚN NO TIENES CUENTA? <Link to="/004">ÚNETE AQUÍ</Link>
              </p>
          </div>

            {/* circulos decorativos*/}
              <div className="cGDecor-1"></div>
              <div className="cGDecor-2"></div>
              <div className="cGDecor-3"></div>
              <div className="cADecor-1"></div>



        </div>
      </div>
   
    );
  }

export default Login;
