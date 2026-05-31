import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./125.css";

function Capacitaciones() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  useEffect(() => { document.title = "CAPACITACIONES"; }, []);

  const esAdmin = usuario.rol === "Administrador" || usuario.rol === "Supervisor";

  return (
    <div className="capacitaciones-page">
      <AppShell
        title="CAPACITACIONES"
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/125"
      >
        <div className="caps-botones">
          <button className="caps-btn" onClick={() => navigate("/126")}>
            CURSOS<br />DISPONIBLES
          </button>
          <button className="caps-btn" onClick={() => navigate("/133")}>
            HISTORIAL DE<br />CURSOS CURSADOS
          </button>
          {esAdmin && (
            <>
              <button className="caps-btn" onClick={() => navigate("/125-A")}>
                AGREGAR<br />NUEVO CURSO
              </button>
              <button className="caps-btn" onClick={() => navigate("/126-A")}>
                SOLICITUDES DE<br />INSCRIPCIÓN
              </button>
            </>
          )}
        </div>
      </AppShell>
    </div>
  );
}

export default Capacitaciones;