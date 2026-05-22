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
// COMPONENTE BUSCAR CERTIFICADO — EMPLEADO
// Muestra solo certificados con estado APROBADO del usuario autenticado
// ==============================
function BuscarCertificado() {
  const navigate = useNavigate();

  const [menuAbierto,   setMenuAbierto]   = useState(false);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);
  const [cargandoCerts, setCargandoCerts] = useState(true);

  const [usuario,       setUsuario]       = useState({ nombre: "", foto: "", rol: "" });
  const [botones,       setBotones]       = useState([]);
  const [certificados,  setCertificados]  = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  // ==============================
  // CARGA INICIAL
  // ==============================
  useEffect(() => {
    document.title = "BUSCAR CERTIFICADO";
    const token = localStorage.getItem("token");

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const resSesion = await fetch("http://localhost:3000/auth/sesion", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!resSesion.ok) { navigate("/001"); return; }

        const dataSesion = await resSesion.json();
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

    const cargarCertificados = async () => {
      try {
        setCargandoCerts(true);
        const res = await fetch("http://localhost:3000/certificados", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();
        setCertificados(data);
      } catch (err) {
        console.error("Error al cargar certificados:", err);
        setCertificados([]);
      } finally {
        setCargandoCerts(false);
      }
    };

    cargarDatos();
    cargarCertificados();
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
    if (filtroActivo === "fecha")  return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "titulo") return a.titulo.localeCompare(b.titulo);
    return 0;
  });

  const toggleSeleccion  = (id) =>
    setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const estaSeleccionado = (id) => seleccionados.includes(id);

  const handleDescargar = () => {
    if (seleccionados.length === 0) {
      alert("Selecciona al menos un certificado para descargar.");
      return;
    }
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

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="buscar-cert-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>BUSCAR<br />CERTIFICADO</h1>
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
              <button
                className={`filtro-opcion ${filtroActivo === "fecha" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "fecha" ? null : "fecha"); setFiltroAbierto(false); }}
              >
                FECHA DE CERTIFICACIÓN
              </button>
              <button
                className={`filtro-opcion ${filtroActivo === "titulo" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "titulo" ? null : "titulo"); setFiltroAbierto(false); }}
              >
                TIPO DE CERTIFICACIÓN (A-Z)
              </button>
            </div>
          )}
        </div>

        {/* LISTA */}
        <div className="cert-lista">
          {cargandoCerts ? (
            <span className="loading-text">Cargando certificados...</span>
          ) : certificadosFiltrados.length === 0 ? (
            <p className="sin-certs">No tienes certificados aprobados aún.</p>
          ) : (
            certificadosFiltrados.map(cert => (
              <div
                key={cert.id}
                className={`cert-item ${estaSeleccionado(cert.id) ? "seleccionado" : ""}`}
                onClick={() => toggleSeleccion(cert.id)}
              >
                <span className={`cert-radio ${estaSeleccionado(cert.id) ? "marcado" : ""}`}></span>
                <span className="cert-texto">CERTIFICACIÓN DE {cert.titulo}</span>
              </div>
            ))
          )}
        </div>

        <button
          className={`btn-descargar ${seleccionados.length > 0 ? "activo" : ""}`}
          onClick={handleDescargar}
        >
          DESCARGAR
        </button>
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

export default BuscarCertificado;