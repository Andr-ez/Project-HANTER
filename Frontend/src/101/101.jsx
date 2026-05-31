import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./101.css";

function Certificados() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  useEffect(() => { document.title = "CERTIFICADOS"; }, []);

  const esAdmin = usuario.rol === "Administrador" || usuario.rol === "Supervisor";

  return (
    <div className="certificados-page">
      <AppShell
        title="CERTIFICADOS"
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/101"
      >
        <div className="cert-botones">
          <button className="cert-btn" onClick={() => navigate("/102")}>
            AÑADIR<br />CERTIFICADO
          </button>
          <button className="cert-btn" onClick={() => navigate("/103")}>
            BUSCAR<br />CERTIFICADO
          </button>
          {esAdmin && (
            <button className="caps-btn" onClick={() => navigate("/103-A")}>
              REVISAR<br />CERTIFICADOS
            </button>
          )}
        </div>
      </AppShell>
    </div>
  );
}

export default Certificados;