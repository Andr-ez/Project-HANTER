import { useNavigate } from "react-router-dom";
import "./404.css";

function PaginaNoEncontrada() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <p className="not-found-code">404</p>
        <h2 className="not-found-titulo">PÁGINA NO ENCONTRADA</h2>
        <p className="not-found-desc">
          La ruta que buscas no existe o fue movida.
        </p>

        <div className="not-found-acciones">
          <button className="not-found-btn" onClick={() => navigate(-1)}>
            ← REGRESAR
          </button>
          <button className="not-found-btn not-found-btn--inicio" onClick={() => navigate("/100")}>
            IR AL INICIO
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaginaNoEncontrada;