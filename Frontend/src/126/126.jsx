// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./126.css";

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
// COMPONENTE CURSOS DISPONIBLES
// ==============================
function CursosDisponibles() {
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

  // Estado del modal de confirmación
  const [cursoSeleccionado,  setCursoSeleccionado]  = useState(null); // curso a inscribir
  const [enviando,           setEnviando]           = useState(false);
  const [inscripcionExitosa, setInscripcionExitosa] = useState(false);

  // ==============================
  // USE EFFECT INICIAL
  // ==============================
  useEffect(() => {
    document.title = "CURSOS DISPONIBLES";

    const token = localStorage.getItem("token");

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const resSesion = await fetch("http://localhost:3000/auth/sesion", {
          headers: { "Authorization": `Bearer ${token}` },
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

    const cargarCursos = async () => {
      try {
        setCargandoCursos(true);

        // GET /cursos/disponibles — cursos activos para inscripción.
        // Respuesta: [{ id, nombre, fecha_inicio, tipo, descripcion }]
        const resCursos = await fetch("http://localhost:3000/cursos/disponibles", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (resCursos.ok) {
          const data = await resCursos.json();
          setCursos(data);
        } else {
          throw new Error("Respuesta no OK del servidor.");
        }
      } catch (err) {
        console.error("Error al cargar cursos:", err);
        // Fallback de desarrollo
        setCursos([
          { id: 1, nombre: "EXCEL AVANZADO",           fecha_inicio: "15/06/2025", tipo: "HERRAMIENTAS OFIMÁTICAS" },
          { id: 2, nombre: "LIDERAZGO Y COMUNICACIÓN", fecha_inicio: "20/06/2025", tipo: "HABILIDADES BLANDAS"     },
          { id: 3, nombre: "SEGURIDAD INFORMÁTICA",    fecha_inicio: "01/07/2025", tipo: "TECNOLOGÍA"              },
          { id: 4, nombre: "INGLÉS NIVEL 1",           fecha_inicio: "10/07/2025", tipo: "IDIOMAS"                 },
          { id: 5, nombre: "GESTIÓN DE PROYECTOS",     fecha_inicio: "18/07/2025", tipo: "ADMINISTRACIÓN"          },
        ]);
      } finally {
        setCargandoCursos(false);
      }
    };

    cargarDatos();
    cargarCursos();
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
      return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
    }
    if (filtroActivo === "tipo") return a.nombre.localeCompare(b.nombre);
    return 0;
  });

  // ==============================
  // CONFIRMAR INSCRIPCIÓN
  // ==============================
  const handleConfirmarInscripcion = async () => {
    if (!cursoSeleccionado) return;
    setEnviando(true);

    try {
      const token = localStorage.getItem("token");

      // POST /cursos/inscripcion — crea una solicitud PENDIENTE.
      // El admin la verá en la página 126-A y se le notifica.
      const res = await fetch("http://localhost:3000/cursos/inscripcion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ id_curso: cursoSeleccionado.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setInscripcionExitosa(true);
      } else {
        alert(data.mensaje || data.error || "Error al enviar la solicitud.");
        setCursoSeleccionado(null);
      }
    } catch (err) {
      console.error("Error al inscribir:", err);
      alert("No se pudo conectar con el servidor.");
      setCursoSeleccionado(null);
    } finally {
      setEnviando(false);
    }
  };

  const cerrarModal = () => {
    setCursoSeleccionado(null);
    setInscripcionExitosa(false);
  };

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="cursos-disp-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>CURSOS<br />DISPONIBLES</h1>
      </div>


      <header className="header-content">
        <img src={menuIcon} alt="Menu" className="icon-btn" onClick={() => setMenuAbierto(true)} />
        <img src={bellIcon} alt="Notificaciones" className="icon-btn" onClick={() => navigate("/500")} />
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
                onClick={() => { setFiltroActivo(filtroActivo === "fecha" ? null : "fecha"); setFiltroAbierto(false); }}
              >
                FECHA DE INICIO DEL CURSO
              </button>
              <button
                className={`filtro-opcion ${filtroActivo === "tipo" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "tipo" ? null : "tipo"); setFiltroAbierto(false); }}
              >
                TIPO DE CURSO (A-Z)
              </button>
            </div>
          )}
        </div>

        {/* LISTA DE CURSOS */}
        <div className="curso-lista">
          {cargandoCursos ? (
            <span className="loading-text">Cargando cursos...</span>
          ) : cursosFiltrados.length === 0 ? (
            <p className="sin-cursos">No hay cursos disponibles en este momento.</p>
          ) : (
            cursosFiltrados.map(curso => (
              <div
                key={curso.id}
                className="curso-item clickable"
                onClick={() => { setCursoSeleccionado(curso); setInscripcionExitosa(false); }}
              >
                <span className="curso-dot">○</span>
                <span className="curso-texto">CURSO DE {curso.nombre}</span>
                <span className="curso-flecha">›</span>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ============================== */}
      {/* MODAL DE CONFIRMACIÓN         */}
      {/* ============================== */}
      {cursoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            {!inscripcionExitosa ? (
              <>
                <p className="modal-label">CONFIRMAR INSCRIPCIÓN</p>

                <div className="modal-curso-nombre">
                  CURSO DE {cursoSeleccionado.nombre}
                </div>

                <p className="modal-detalle">
                  INICIO: {cursoSeleccionado.fecha_inicio}
                </p>

                <p className="modal-aviso">
                  Tu solicitud quedará pendiente hasta que un administrador la apruebe.
                </p>

                <div className="modal-acciones">
                  <button
                    className="modal-btn-cancelar"
                    onClick={cerrarModal}
                    disabled={enviando}
                  >
                    CANCELAR
                  </button>
                  <button
                    className="modal-btn-confirmar"
                    onClick={handleConfirmarInscripcion}
                    disabled={enviando}
                  >
                    {enviando ? "ENVIANDO..." : "CONFIRMAR"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-exito-icono">✓</div>
                <p className="modal-exito-titulo">¡SOLICITUD ENVIADA!</p>
                <p className="modal-aviso">
                  Tu solicitud de inscripción fue enviada. El administrador la revisará pronto.
                </p>
                <button className="modal-btn-confirmar" onClick={cerrarModal}>
                  ENTENDIDO
                </button>
              </>
            )}

          </div>
        </div>
      )}

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

export default CursosDisponibles;