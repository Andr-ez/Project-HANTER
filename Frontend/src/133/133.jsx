// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./133.css";

// Íconos
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
// COMPONENTE HISTORIAL CURSOS
// ==============================
function HistorialCursos() {
  const navigate = useNavigate();

  const [menuAbierto,    setMenuAbierto]    = useState(false);
  const [cargando,       setCargando]       = useState(true);
  const [error,          setError]          = useState(null);
  const [cargandoCursos, setCargandoCursos] = useState(true);

  const [usuario, setUsuario] = useState({ nombre: "", foto: "", rol: "" });
  const [botones, setBotones] = useState([]);
  const [cursos,  setCursos]  = useState([]);

  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  // ==============================
  // USE EFFECT INICIAL
  // ==============================
  useEffect(() => {
    document.title = "HISTORIAL CURSOS";

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const resSesion = await fetch("http://localhost:3000/auth/sesion", { headers: { "Authorization": `Bearer ${token}` } });

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
        setError(".");
        setUsuario({ nombre: "Jaime Antonio Marin", foto: null, rol: "EMPLEADO" });
        setBotones([
          { id: 1, nombre: "INICIO",         link: "/100",    posicion: ["header", "sidebar"], hijos: [] },
          { id: 2, nombre: "CERTIFICADOS",   link: "/101",    posicion: ["header", "sidebar"], hijos: [] },
          { id: 3, nombre: "NOMINA",         link: "/104", posicion: ["header", "sidebar"], hijos: [] },
          { id: 4, nombre: "CAPACITACIONES", link: "/125",    posicion: ["header", "sidebar"], hijos: [] },
          {
            id: 5, nombre: "BENEFICIOS", link: null, posicion: ["sidebar"],
            hijos: [
              { id: 51, nombre: "VISUALIZAR", link: "/crono/general"   },
              { id: 52, nombre: "SOLICITAR",  link: "/crono/induccion" },
            ],
          },
          { id: 7, nombre: "CONFIGURACIÓN", link: "/config", posicion: ["sidebar"], hijos: [] },
        ]);
      } finally {
        setCargando(false);
      }
    };

    const cargarHistorial = async () => {
      try {
        setCargandoCursos(true);

        // =====================================================================
        // TODO BACKEND — GET /cursos/historial
        //
        // Retorna los cursos cursados/completados por el usuario autenticado.
        //
        // Respuesta esperada (array):
        // [
        //   {
        //     id:           number,  — ID único del registro
        //     nombre:       string,  — Nombre del curso
        //     fecha_inicio: string,  — Fecha de inicio (DD/MM/AA)
        //     tipo:         string,  — Tipo/categoría del curso
        //     estado:       string,  — "COMPLETADO" | "EN PROGRESO" | "ABANDONADO"
        //   },
        //   ...
        // ]
        // =====================================================================
        const resCursos = await fetch("http://localhost:3000/cursos/historial", { credentials: "include" });

        if (resCursos.ok) {
          const data = await resCursos.json();
          setCursos(data);
        } else {
          throw new Error("Respuesta no OK del servidor.");
        }

      } catch (err) {
        console.error("Error al cargar historial:", err);
        // Fallback de desarrollo
        setCursos([
          { id: 1, nombre: "EXCEL BÁSICO",             fecha_inicio: "10/01/2025", tipo: "HERRAMIENTAS OFIMÁTICAS", estado: "COMPLETADO"   },
          { id: 2, nombre: "COMUNICACIÓN EFECTIVA",    fecha_inicio: "15/02/2025", tipo: "HABILIDADES BLANDAS",     estado: "COMPLETADO"   },
          { id: 3, nombre: "INTRODUCCIÓN A PYTHON",    fecha_inicio: "01/03/2025", tipo: "TECNOLOGÍA",              estado: "COMPLETADO"   },
          { id: 4, nombre: "INGLÉS NIVEL 1",           fecha_inicio: "20/03/2025", tipo: "IDIOMAS",                 estado: "EN PROGRESO"  },
          { id: 5, nombre: "PRIMEROS AUXILIOS",        fecha_inicio: "05/04/2025", tipo: "SALUD Y SEGURIDAD",       estado: "COMPLETADO"   },
        ]);
      } finally {
        setCargandoCursos(false);
      }
    };

    cargarDatos();
    cargarHistorial();
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
  const cursosFiltrados = [...cursos].sort((a, b) => {
    if (filtroActivo === "fecha") {
      const [dA, mA, yA] = a.fecha_inicio.split("/");
      const [dB, mB, yB] = b.fecha_inicio.split("/");
      return new Date(`20${yA}`, mA - 1, dA) - new Date(`20${yB}`, mB - 1, dB);
    }
    if (filtroActivo === "tipo") return a.nombre.localeCompare(b.nombre);
    return 0;
  });

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="historial-cursos-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>HISTORIAL<br />CURSOS</h1>
      </div>

      <button className="back-btn-133" onClick={() => navigate("/125")}>←</button>

      <header className="header-content">
        <img src={menuIcon} alt="Menu" className="icon-btn" onClick={() => setMenuAbierto(true)} />
        <img src={bellIcon} alt="Notificaciones" className="icon-btn" />
      </header>

      <nav className="nav-horizontal">
        {cargando ? (
          <span className="loading-text">Cargando...</span>
        ) : (
          botonesHeader.map(btn => (
            <button
              key={btn.id}
              className={btn.link === "/125" ? "active" : ""}
              onClick={() => navigate(btn.link)}
            >
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
                onClick={() => {
                  setFiltroActivo(filtroActivo === "fecha" ? null : "fecha");
                  setFiltroAbierto(false);
                }}
              >
                FECHA DE INICIO DEL CURSO
              </button>
              <button
                className={`filtro-opcion ${filtroActivo === "tipo" ? "seleccionada" : ""}`}
                onClick={() => {
                  setFiltroActivo(filtroActivo === "tipo" ? null : "tipo");
                  setFiltroAbierto(false);
                }}
              >
                TIPO DE CURSO (A-Z)
              </button>
            </div>
          )}
        </div>

        {/* LISTA DE CURSOS */}
        <div className="historial-lista">
          {cargandoCursos ? (
            <span className="loading-text">Cargando historial...</span>
          ) : cursosFiltrados.length === 0 ? (
            <p className="sin-cursos">No tienes cursos en tu historial aún.</p>
          ) : (
            cursosFiltrados.map(curso => (
              <div key={curso.id} className="historial-item">
                <span className="curso-dot">○</span>
                <span className="curso-texto">CURSO DE {curso.nombre}</span>
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
          <div
            className="user-avatar-circle"
            onClick={() => { setMenuAbierto(false); navigate("/perfil"); }}
            style={{ cursor: "pointer" }}
            title="Ver mi perfil"
          >
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

export default HistorialCursos;
