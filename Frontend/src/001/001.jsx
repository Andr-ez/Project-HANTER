//llamado de React y otras dependencias necesarias para la aplicación
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./001.css";

//Nombre de la función que define el componente de login en el main.jsx
function Login() {
    const [usuario, setUsuario] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
  useEffect(() => {
    document.title = "Login";
    }, []);

      const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3000/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_usuario: usuario, password })
      });
      const data = await response.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        navigate("/100"); // redirige al dashboard
      } else {
        alert("Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

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
            type="text"
            placeholder="Correo / Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <span>🔑</span>
          <input
            type="password"
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Botón de recuperacion de contrasena */}
        <Link to="/002" className="olvido">
          ¿OLVIDASTE TU CONTRASEÑA?
        </Link>

          {/* Botón de inicio de sesión */}
        <button className="btn-login" onClick={handleLogin}>
          INICIAR SESIÓN
        </button>

        {/* Botón de registro */}
        <p className="registro">
          ¿AÚN NO TIENES CUENTA? <a href="/004">ÚNETE AQUÍ</a>
        </p>
      </div>

    </div>
   
  );
}

export default Login;
