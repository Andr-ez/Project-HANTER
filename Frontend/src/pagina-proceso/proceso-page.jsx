// ============================================================
// IMPORTACIONES
// ============================================================
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./proceso-page.css";


function ProcesoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Página en proceso";
  }, []);


  return (
    <div className="proceso-page">
      <div className="circuloFondo">

        {/* Logo */}
        <div className="logo-container">
          <img src="/fotos/LOGO MEL.png" alt="Logo" />
        </div>

        {/* Título */}
        <div className="title">
          <h1>Página en proceso</h1>
        </div>

        {/* Texto descriptivo */}
        <div className="descripcion">
          <p>
           Creemos que la calidad requiere tiempo. Actualmente, nuestro equipo técnico está 
           implementando nuevas funciones y mejorando la interfaz para asegurar que, en tu próxima 
           visita, todo funcione a la perfección. Agradecemos tu paciencia y comprensión durante este 
           proceso de mejora continua.
          </p>
        </div>

        {/* Decoraciones */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>

      </div>

      {/* Botón volver — fuera de circuloFondo para que position fixed funcione */}
      <div className="buttons">
        <button className="btnVolver" onClick={() => navigate(-1)}>
          VOLVER
        </button>
      </div>

    </div>
  );
}

export default ProcesoPage;
