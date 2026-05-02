// ============================================================
// IMPORTACIONES
// ============================================================
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./proceso-page.css";


function ProcesoPage() {


  useEffect(() => {
    document.title = "Página en proceso";
  }, []);


  const imagenes = [
    "/fotos/enProceso/enProceso-1.jpeg",
    "/fotos/enProceso/enProceso-2.jpeg",
    "/fotos/enProceso/enProceso-3.jpeg",
    "/fotos/enProceso/enProceso-4.jpeg",
    "/fotos/enProceso/enProceso-5.jpeg",
  ];

  const [imagenRandom, setImagenRandom] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * imagenes.length);
    setImagenRandom(imagenes[randomIndex]);
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
            Nuestros desarrolladores están trabajando para crear esta página.
          </p>
        </div>

        {/* Imagen aleatoria */}
        <div className="imagen-random">
          <img src={imagenRandom} alt="Imagen en proceso" />
        </div>

        {/* Botón volver */}
        <div className="buttons">
          <Link to="/000" className="btnVolver">
            VOLVER
          </Link>
        </div>

        {/* Decoraciones */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>

      </div>
    </div>
  );
}

// Exportación del componente para poder usarlo en main.jsx
export default ProcesoPage;
