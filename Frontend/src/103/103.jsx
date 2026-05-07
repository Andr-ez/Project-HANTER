// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./103.css";

// Íconos
import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";

// PDFs de ejemplo — solo para fallback de desarrollo
import certificadoCiberseguridad from "/fotos/pdf/certificados/certificadoCiberseguridad.pdf";
import certificadoIngles1        from "/fotos/pdf/certificados/certificadoIngles1.pdf";
import certificadoMarketing      from "/fotos/pdf/certificados/certificadoMarketing.pdf";
import certificadoIngles3        from "/fotos/pdf/certificados/certificadoIngles3.pdf";
import certificadoPowerPoint     from "/fotos/pdf/certificados/certificadoPowerPoint.pdf";

// ==============================
// COMPONENTE — BOTÓN CON HIJOS
// ==============================
function SidebarBtn({ btn, navigate, cerrarMenu }) {
  const [abierto, setAbierto] = useState(false);
  const tieneHijos = btn.hijos && btn.hijos.length > 0;

  const handleClick = () => {
    if (tieneHijos) {
      setAbierto(prev => !prev);
    } else {
      cerrarMenu();
      navigate(btn.link);
    }
  };

  return (
    <div className="sidebar-item">
      <button
        className={`sidebar-btn ${tieneHijos ? "tiene-hijos" : ""} ${abierto ? "abierto" : ""}`}
        onClick={handleClick}
      >
        <span>{btn.nombre}</span>
        {tieneHijos && (
          <span className={`sidebar-arrow ${abierto ? "rotado" : ""}`}>›</span>
        )}
      </button>

      {tieneHijos && (
        <div className={`sidebar-hijos ${abierto ? "visible" : ""}`}>
          {btn.hijos.map(hijo => (
            <button
              key={hijo.id}
              className="sidebar-hijo-btn"
              onClick={() => {
                cerrarMenu();
                navigate(hijo.link);
              }}
            >
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
// Solo muestra certificados con estado "APROBADO"
// ==============================
function BuscarCertificado() {
  const navigate = useNavigate();

  const [menuAbierto,   setMenuAbierto]   = useState(false);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);
  const [cargandoCerts, setCargandoCerts] = useState(true);

  const [usuario,      setUsuario]      = useState({ nombre: "", foto: "", rol: "" });
  const [botones,      setBotones]      = useState([]);
  const [certificados, setCertificados] = useState([]);
  const [seleccionados,setSeleccionados]= useState([]);

  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  // ==============================
  // USE EFFECT INICIAL
  // ==============================
  useEffect(() => {
    document.title = "BUSCAR CERTIFICADO";

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const resSesion = await fetch("http://localhost:3000/auth/sesion", { credentials: "include" });

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
        setError("No se pudo conectar con el servidor.");
        setUsuario({ nombre: "Jaime Antonio Marin", foto: null, rol: "EMPLEADO" });
        setBotones([
          { id: 1, nombre: "INICIO",         link: "/100",    posicion: ["header", "sidebar"], hijos: [] },
          { id: 2, nombre: "CERTIFICADOS",   link: "/101",    posicion: ["header", "sidebar"], hijos: [] },
          { id: 3, nombre: "NOMINA",         link: "/104", posicion: ["header", "sidebar"], hijos: [] },
          { id: 4, nombre: "CAPACITACIONES", link: "/125",   posicion: ["header", "sidebar"], hijos: [] },
          {
            id: 5, nombre: "BENEFICIOS", link: null, posicion: ["sidebar"],
            hijos: [
              { id: 51, nombre: "VISUALIZAR", link: "/crono/general"   },
              { id: 52, nombre: "SOLICITAR",  link: "/crono/induccion" },
            ]
          },
          { id: 7, nombre: "CONFIGURACIÓN", link: "/config", posicion: ["sidebar"], hijos: [] },
        ]);
      } finally {
        setCargando(false);
      }
    };

    const cargarCertificados = async () => {
      try {
        setCargandoCerts(true);

        // =====================================================================
        // TODO BACKEND — GET /certificados
        //
        // Retorna solo los certificados del usuario autenticado
        // con estado = "APROBADO" (los PENDIENTES y RECHAZADOS NO se muestran aquí).
        //
        // Respuesta esperada (array):
        // [
        //   {
        //     id:          number,   — ID único en la BD
        //     institucion: string,   — Nombre de la institución
        //     titulo:      string,   — Título del certificado
        //     fecha:       string,   — Fecha de certificación (DD/MM/AA)
        //     ruta_pdf:    string    — URL/ruta del PDF en el servidor
        //   },
        //   ...
        // ]
        // =====================================================================
        const resCerts = await fetch("http://localhost:3000/certificados", { credentials: "include" });

        if (resCerts.ok) {
          const data = await resCerts.json();
          setCertificados(data);
        } else {
          throw new Error("Respuesta no OK del servidor.");
        }

      } catch (err) {
        console.error("Error al cargar certificados:", err);
        // Fallback de desarrollo con PDFs locales
        setCertificados([
          { id: 1, institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "CIBERSEGURIDAD",                fecha: "28/11/2024", ruta_pdf: certificadoCiberseguridad },
          { id: 2, institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "ENGLISH DOES WORK - LEVEL 1",  fecha: "24/06/2024", ruta_pdf: certificadoIngles1        },
          { id: 3, institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "MARKETING DIGITAL",            fecha: "24/10/2024", ruta_pdf: certificadoMarketing      },
          { id: 4, institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "ENGLISH DOES WORK - LEVEL 3",  fecha: "11/01/2025", ruta_pdf: certificadoIngles3        },
          { id: 5, institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "USO DE MICROSOFT POWER POINT", fecha: "07/09/2024", ruta_pdf: certificadoPowerPoint     },
        ]);
      } finally {
        setCargandoCerts(false);
      }
    };

    cargarDatos();
    cargarCertificados();
  }, [navigate]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) {
        setFiltroAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  // Ordenar según filtro activo
  const certificadosFiltrados = [...certificados].sort((a, b) => {
    if (filtroActivo === "fecha")  return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "titulo") return a.titulo.localeCompare(b.titulo);
    return 0;
  });

  const toggleSeleccion  = (id) => setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
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
        <img src={bellIcon} alt="Notificaciones" className="icon-btn" />
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
            FILTRAR POR
            <span className="filtro-icono">▼</span>
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
                <span className="cert-texto">
                   CERTIFICACIÓN DE {cert.titulo}
                </span>
              </div>
            ))
          )}
        </div>

        {/* DESCARGAR */}
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
          <div className="user-avatar-circle">
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