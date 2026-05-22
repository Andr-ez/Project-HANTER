// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./103.css";

import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";

// ==============================
// COMPONENTE — BOTÓN CON HIJOS
// ==============================
function SidebarBtn({ btn, navigate, cerrarMenu }) {
  const [abierto, setAbierto] = useState(false);
  const tieneHijos = btn.hijos && btn.hijos.length > 0;

  const handleClick = () => {
    if (tieneHijos) setAbierto(prev => !prev);
    else { cerrarMenu(); navigate(btn.link); }
  };

  return (
    <div className="sidebar-item">
      <button
        className={`sidebar-btn ${tieneHijos ? "tiene-hijos" : ""} ${abierto ? "abierto" : ""}`}
        onClick={handleClick}
      >
        <span>{btn.nombre}</span>
        {tieneHijos && <span className={`sidebar-arrow ${abierto ? "rotado" : ""}`}>›</span>}
      </button>

      {tieneHijos && (
        <div className={`sidebar-hijos ${abierto ? "visible" : ""}`}>
          {btn.hijos.map(hijo => (
            <button key={hijo.id} className="sidebar-hijo-btn"
              onClick={() => { cerrarMenu(); navigate(hijo.link); }}>
              <span className="hijo-dot">·</span>
              {hijo.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================
// COMPONENTE ADMIN — REVISAR CERTIFICADOS
// ==============================
function SolicitudCertificadosAdmin() {
  const navigate = useNavigate();

  const [menuAbierto,   setMenuAbierto]   = useState(false);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);
  const [cargandoCerts, setCargandoCerts] = useState(true);

  const [usuario,      setUsuario]      = useState({ nombre: "", foto: "", rol: "" });
  const [botones,      setBotones]      = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [expandido,    setExpandido]    = useState(null);

  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  // ==============================
  // CARGA INICIAL
  // ==============================
  useEffect(() => {
    document.title = "ADMIN — CERTIFICADOS";
    const token = localStorage.getItem("token");

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const resSesion = await fetch("http://localhost:3000/auth/sesion", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!resSesion.ok) { navigate("/001"); return; }

        const dataSesion = await resSesion.json();

        if (dataSesion.usuario.rol !== "Administrador" && dataSesion.usuario.rol !== "Supervisor") {
          navigate("/103");
          return;
        }

        setUsuario({
          nombre: dataSesion.usuario.nombre,
          foto:   dataSesion.usuario.foto || null,
          rol:    dataSesion.usuario.rol,
        });
        setBotones(dataSesion.botones);
      } catch (err) {
        console.error("Error al cargar sesión:", err);
        setError("No se pudo verificar la sesión.");
      } finally {
        setCargando(false);
      }
    };

    const cargarPendientes = async () => {
      try {
        setCargandoCerts(true);
        const res = await fetch("http://localhost:3000/certificados/pendientes", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();
        setCertificados(data);
      } catch (err) {
        console.error("Error al cargar pendientes:", err);
        setCertificados([]);
      } finally {
        setCargandoCerts(false);
      }
    };

    cargarDatos();
    cargarPendientes();
  }, [navigate]);

  // Cerrar dropdown al clicar fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) setFiltroAbierto(false);
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  const certificadosFiltrados = [...certificados].sort((a, b) => {
    if (filtroActivo === "fecha")    return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "titulo")   return a.titulo.localeCompare(b.titulo);
    if (filtroActivo === "empleado") return a.nombre_empleado.localeCompare(b.nombre_empleado);
    return 0;
  });

  // ==============================
  // APROBAR
  // ==============================
  const handleAprobar = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/certificados/${id}/aprobar`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
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

  // ==============================
  // RECHAZAR
  // ==============================
  const handleRechazar = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que quieres rechazar este certificado?");
    if (!confirmar) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/certificados/${id}/rechazar`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
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

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="buscar-cert-page admin-cert-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>REVISAR<br />CERTIFICADOS</h1>
      </div>

      <button className="back-btn-103" onClick={() => navigate("/101")}>←</button>

      <header className="header-content">
        <img src={menuIcon} alt="Menu" className="icon-btn" onClick={() => setMenuAbierto(true)} />
        <img src={bellIcon} alt="Notificaciones" className="icon-btn" onClick={() => navigate("/500")} />
      </header>

      <nav className="nav-horizontal">
        {cargando ? (
          <span className="loading-text">Cargando...</span>
        ) : (
          botonesHeader.map(btn => (
            <button key={btn.id} className={btn.link === "/101" ? "active" : ""} onClick={() => navigate(btn.link)}>
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      <main className="main-content">
        {error && <p className="error-msg">{error}</p>}

        {!cargandoCerts && certificados.length > 0 && (
          <div className="admin-badge-pendientes">
            {certificados.length} pendiente{certificados.length !== 1 ? "s" : ""} de revisión
          </div>
        )}

        {/* FILTRO */}
        <div className="filtro-wrapper" ref={filtroRef}>
          <button
            className={`filtro-btn ${filtroActivo ? "activo" : ""}`}
            onClick={() => setFiltroAbierto(prev => !prev)}
          >
            FILTRAR POR <span className="filtro-icono">▼</span>
          </button>

          {filtroAbierto && (
            <div className="filtro-dropdown">
              {[
                { key: "fecha",    label: "FECHA DE CERTIFICACIÓN" },
                { key: "titulo",   label: "TIPO DE CERTIFICACIÓN (A-Z)" },
                { key: "empleado", label: "EMPLEADO (A-Z)" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`filtro-opcion ${filtroActivo === key ? "seleccionada" : ""}`}
                  onClick={() => { setFiltroActivo(filtroActivo === key ? null : key); setFiltroAbierto(false); }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LISTA */}
        <div className="cert-lista">
          {cargandoCerts ? (
            <span className="loading-text">Cargando certificados...</span>
          ) : certificadosFiltrados.length === 0 ? (
            <p className="sin-certs">No hay certificados pendientes de revisión. 🎉</p>
          ) : (
            certificadosFiltrados.map(cert => (
              <div key={cert.id} className="admin-cert-card">

                <div
                  className={`admin-cert-fila ${expandido === cert.id ? "expandida" : ""}`}
                  onClick={() => setExpandido(expandido === cert.id ? null : cert.id)}
                >
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
                      <iframe
                        src={cert.ruta_pdf}
                        title={`PDF - ${cert.titulo}`}
                        className="admin-pdf-iframe"
                      />
                    </div>

                    <div className="admin-acciones">
                      <button
                        className="btn-aprobar"
                        onClick={(e) => { e.stopPropagation(); handleAprobar(cert.id); }}
                      >
                        ✓ APROBAR
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={(e) => { e.stopPropagation(); handleRechazar(cert.id); }}
                      >
                        ✕ RECHAZAR
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      </main>

      <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
        <button className="close-btn-sidebar" onClick={() => setMenuAbierto(false)}>←</button>
        <div className="user-info-sidebar">
          <div>
            <span style={{ display: "block", fontSize: "14px" }}>{cargando ? "Cargando..." : usuario.nombre}</span>
            <span style={{ display: "block", fontSize: "11px", opacity: 0.7 }}>{usuario.rol}</span>
          </div>
          <div className="user-avatar-circle"
            onClick={() => { setMenuAbierto(false); navigate("/perfil"); }}
            style={{ cursor: "pointer" }} title="Ver mi perfil">
            <img src={usuario.foto || userPlaceholder} alt="User" />
          </div>
        </div>
        <nav className="sidebar-nav">
          {botonesSidebar.map(btn => (
            <SidebarBtn key={btn.id} btn={btn} navigate={navigate} cerrarMenu={() => setMenuAbierto(false)} />
          ))}
        </nav>
      </aside>

      {menuAbierto && <div className="overlay" onClick={() => setMenuAbierto(false)} />}

      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>
      <div className="cGDecor-3"></div>

    </div>
  );
}

export default SolicitudCertificadosAdmin;