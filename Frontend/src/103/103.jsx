import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./103.css";

function BuscarCertificado() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  const [cargandoCerts, setCargandoCerts] = useState(true);
  const [certificados,  setCertificados]  = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  useEffect(() => {
    document.title = "BUSCAR CERTIFICADO";
    const token = localStorage.getItem("token");

    const cargarCertificados = async () => {
      try {
        setCargandoCerts(true);
        const res = await fetch("http://localhost:3000/certificados", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error del servidor");
        setCertificados(await res.json());
      } catch (err) {
        console.error("Error al cargar certificados:", err);
        setCertificados([]);
      } finally {
        setCargandoCerts(false);
      }
    };

    cargarCertificados();
  }, []);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) setFiltroAbierto(false);
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const certificadosFiltrados = [...certificados].sort((a, b) => {
    if (filtroActivo === "fecha")  return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "titulo") return a.titulo.localeCompare(b.titulo);
    return 0;
  });

  const toggleSeleccion  = (id) => setSeleccionados(prev =>
    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const estaSeleccionado = (id) => seleccionados.includes(id);

  const handleDescargar = () => {
    if (seleccionados.length === 0) { alert("Selecciona al menos un certificado para descargar."); return; }
    seleccionados.forEach(id => {
      const cert = certificados.find(c => c.id === id);
      if (!cert) return;
      const link = document.createElement("a");
      link.href = cert.ruta_pdf;
      link.download = `certificado-${cert.titulo.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="buscar-cert-page">
      <button className="back-btn-103" onClick={() => navigate("/101")}>←</button>
      <AppShell
        title="BUSCAR CERTIFICADO"
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/101"
      >
        <div className="filtro-wrapper" ref={filtroRef}>
          <button className={`filtro-btn ${filtroActivo ? "activo" : ""}`}
            onClick={() => setFiltroAbierto(prev => !prev)}>
            FILTRAR POR <span className="filtro-icono">▼</span>
          </button>
          {filtroAbierto && (
            <div className="filtro-dropdown">
              <button className={`filtro-opcion ${filtroActivo === "fecha" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "fecha" ? null : "fecha"); setFiltroAbierto(false); }}>
                FECHA DE CERTIFICACIÓN
              </button>
              <button className={`filtro-opcion ${filtroActivo === "titulo" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "titulo" ? null : "titulo"); setFiltroAbierto(false); }}>
                TIPO DE CERTIFICACIÓN (A-Z)
              </button>
            </div>
          )}
        </div>

        <div className="cert-lista">
          {cargandoCerts ? (
            <span className="loading-text">Cargando certificados...</span>
          ) : certificadosFiltrados.length === 0 ? (
            <p className="sin-certs">No tienes certificados aprobados aún.</p>
          ) : (
            certificadosFiltrados.map(cert => (
              <div key={cert.id}
                className={`cert-item ${estaSeleccionado(cert.id) ? "seleccionado" : ""}`}
                onClick={() => toggleSeleccion(cert.id)}>
                <span className={`cert-radio ${estaSeleccionado(cert.id) ? "marcado" : ""}`}></span>
                <span className="cert-texto">CERTIFICACIÓN DE {cert.titulo}</span>
              </div>
            ))
          )}
        </div>

        <button className={`btn-descargar ${seleccionados.length > 0 ? "activo" : ""}`}
          onClick={handleDescargar}>
          DESCARGAR
        </button>
      </AppShell>
      <div className="cGDecor-3"></div>
    </div>
  );
}

export default BuscarCertificado;