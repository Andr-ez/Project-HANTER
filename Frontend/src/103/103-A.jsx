import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./103.css";

function SolicitudCertificadosAdmin() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  const [cargandoCerts, setCargandoCerts] = useState(true);
  const [certificados,  setCertificados]  = useState([]);
  const [expandido,     setExpandido]     = useState(null);
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  useEffect(() => {
    document.title = "ADMIN — CERTIFICADOS";
    const token = localStorage.getItem("token");

    const cargarPendientes = async () => {
      try {
        setCargandoCerts(true);
        const res = await fetch("http://localhost:3000/certificados/pendientes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error del servidor");
        setCertificados(await res.json());
      } catch (err) {
        console.error("Error al cargar pendientes:", err);
        setCertificados([]);
      } finally {
        setCargandoCerts(false);
      }
    };

    cargarPendientes();
  }, []);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) setFiltroAbierto(false);
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const certificadosFiltrados = [...certificados].sort((a, b) => {
    if (filtroActivo === "fecha")    return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "titulo")   return a.titulo.localeCompare(b.titulo);
    if (filtroActivo === "empleado") return a.nombre_empleado.localeCompare(b.nombre_empleado);
    return 0;
  });

  const handleAprobar = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/certificados/${id}/aprobar`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCertificados(prev => prev.filter(c => c.id !== id));
        if (expandido === id) setExpandido(null);
        alert("✓ Certificado aprobado. El empleado fue notificado.");
      } else {
        alert(data.error || "Error al aprobar el certificado.");
      }
    } catch (err) {
      console.error("Error al aprobar:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const handleRechazar = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres rechazar este certificado?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/certificados/${id}/rechazar`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCertificados(prev => prev.filter(c => c.id !== id));
        if (expandido === id) setExpandido(null);
        alert("Certificado rechazado. El empleado fue notificado.");
      } else {
        alert(data.error || "Error al rechazar el certificado.");
      }
    } catch (err) {
      console.error("Error al rechazar:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="buscar-cert-page">
      <button className="back-btn-103" onClick={() => navigate("/101")}>←</button>
      <AppShell
        title="REVISAR CERTIFICADOS"
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/101"
      >
        {!cargandoCerts && certificados.length > 0 && (
          <div className="admin-badge-pendientes">
            {certificados.length} pendiente{certificados.length !== 1 ? "s" : ""} de revisión
          </div>
        )}

        <div className="filtro-wrapper" ref={filtroRef}>
          <button className={`filtro-btn ${filtroActivo ? "activo" : ""}`}
            onClick={() => setFiltroAbierto(prev => !prev)}>
            FILTRAR POR <span className="filtro-icono">▼</span>
          </button>
          {filtroAbierto && (
            <div className="filtro-dropdown">
              {[{ key: "fecha", label: "FECHA DE CERTIFICACIÓN" },
                { key: "titulo", label: "TIPO DE CERTIFICACIÓN (A-Z)" },
                { key: "empleado", label: "EMPLEADO (A-Z)" }
              ].map(({ key, label }) => (
                <button key={key}
                  className={`filtro-opcion ${filtroActivo === key ? "seleccionada" : ""}`}
                  onClick={() => { setFiltroActivo(filtroActivo === key ? null : key); setFiltroAbierto(false); }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cert-lista">
          {cargandoCerts ? (
            <span className="loading-text">Cargando certificados...</span>
          ) : certificadosFiltrados.length === 0 ? (
            <p className="sin-certs">No hay certificados pendientes de revisión. 🎉</p>
          ) : (
            certificadosFiltrados.map(cert => (
              <div key={cert.id} className="admin-cert-card">
                <div className={`admin-cert-fila ${expandido === cert.id ? "expandida" : ""}`}
                  onClick={() => setExpandido(expandido === cert.id ? null : cert.id)}>
                  <div className="admin-cert-info">
                    <span className="admin-cert-empleado">{cert.nombre_empleado}</span>
                    <span className="admin-cert-titulo">CERTIFICACIÓN DE {cert.titulo}</span>
                  </div>
                  <span className="admin-expand-arrow">{expandido === cert.id ? "▲" : "▼"}</span>
                </div>
                {expandido === cert.id && (
                  <div className="admin-cert-detalle">
                    <div className="admin-detalle-info">
                      <p><strong>Empleado:</strong> {cert.nombre_empleado}</p>
                      <p><strong>Institución:</strong> {cert.institucion}</p>
                      <p><strong>Título:</strong> {cert.titulo}</p>
                      <p><strong>Fecha:</strong> {cert.fecha}</p>
                    </div>
                    <div className="admin-pdf-viewer">
                      <iframe src={cert.ruta_pdf} title={`PDF - ${cert.titulo}`} className="admin-pdf-iframe" />
                    </div>
                    <div className="admin-acciones">
                      <button className="btn-aprobar" onClick={(e) => { e.stopPropagation(); handleAprobar(cert.id); }}>
                        ✓ APROBAR
                      </button>
                      <button className="btn-rechazar" onClick={(e) => { e.stopPropagation(); handleRechazar(cert.id); }}>
                        ✕ RECHAZAR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </AppShell>
      <div className="cGDecor-3"></div>
    </div>
  );
}

export default SolicitudCertificadosAdmin;