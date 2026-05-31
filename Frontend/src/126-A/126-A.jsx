// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./126-A.css";

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
// COMPONENTE ADMIN — SOLICITUDES DE INSCRIPCIÓN
// Muestra todas las solicitudes de inscripción PENDIENTES.
// El administrador puede matricular o declinar cada solicitud.
// Al decidir, el backend envía una notificación al empleado.
// ==============================
function AdminInscripciones() {
  const navigate = useNavigate();

  const [menuAbierto,       setMenuAbierto]       = useState(false);
  const [cargando,          setCargando]          = useState(true);
  const [error,             setError]             = useState(null);
  const [cargandoSolicitud, setCargandoSolicitud] = useState(true);

  const [usuario,     setUsuario]     = useState({ nombre: "", foto: "", rol: "" });
  const [botones,     setBotones]     = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  // ID de la solicitud expandida
  const [expandida, setExpandida] = useState(null);

  // Filtro
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  // ==============================
  // USE EFFECT INICIAL
  // ==============================
  useEffect(() => {
    document.title = "ADMIN — INSCRIPCIONES";

    const token = localStorage.getItem("token");

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const resSesion = await fetch("http://localhost:3000/auth/sesion", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!resSesion.ok) { navigate("/001"); return; }

        const dataSesion = await resSesion.json();

        // Redirigir si el usuario NO es administrador/supervisor
        if (dataSesion.usuario.rol !== "Administrador" && dataSesion.usuario.rol !== "Supervisor") {
          navigate("/126");
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
        setError(".");
        setUsuario({ nombre: "Admin HANTER", foto: null, rol: "ADMINISTRADOR" });
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
        ]);
      } finally {
        setCargando(false);
      }
    };

    const cargarSolicitudes = async () => {
      try {
        setCargandoSolicitud(true);

        // GET /cursos/inscripciones/pendientes — solo admin.
        // Respuesta: [{ id, id_usuario, nombre_empleado, id_curso,
        //               nombre_curso, fecha_inicio, tipo_curso,
        //               fecha_solicitud, estado }]
        const resSolicitudes = await fetch(
          "http://localhost:3000/cursos/inscripciones/pendientes",
          { headers: { "Authorization": `Bearer ${token}` } }
        );

        if (resSolicitudes.ok) {
          const data = await resSolicitudes.json();
          setSolicitudes(data);
        } else {
          throw new Error("Respuesta no OK del servidor.");
        }

      } catch (err) {
        console.error("Error al cargar solicitudes:", err);
        // Fallback de desarrollo
        setSolicitudes([
          {
            id: 1, id_usuario: 10, nombre_empleado: "Laura Gómez",
            id_curso: 3, nombre_curso: "SEGURIDAD INFORMÁTICA",
            fecha_inicio: "01/07/2025", tipo_curso: "TECNOLOGÍA",
            fecha_solicitud: "05/05/2025", estado: "PENDIENTE",
          },
          {
            id: 2, id_usuario: 11, nombre_empleado: "Carlos Herrera",
            id_curso: 1, nombre_curso: "EXCEL AVANZADO",
            fecha_inicio: "15/06/2025", tipo_curso: "HERRAMIENTAS OFIMÁTICAS",
            fecha_solicitud: "04/05/2025", estado: "PENDIENTE",
          },
          {
            id: 3, id_usuario: 12, nombre_empleado: "Sofía Ramírez",
            id_curso: 4, nombre_curso: "INGLÉS NIVEL 1",
            fecha_inicio: "10/07/2025", tipo_curso: "IDIOMAS",
            fecha_solicitud: "03/05/2025", estado: "PENDIENTE",
          },
          {
            id: 4, id_usuario: 13, nombre_empleado: "Pedro Vargas",
            id_curso: 2, nombre_curso: "LIDERAZGO Y COMUNICACIÓN",
            fecha_inicio: "20/06/2025", tipo_curso: "HABILIDADES BLANDAS",
            fecha_solicitud: "02/05/2025", estado: "PENDIENTE",
          },
        ]);
      } finally {
        setCargandoSolicitud(false);
      }
    };

    cargarDatos();
    cargarSolicitudes();
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

  // Ordenar según filtro
  const solicitudesFiltradas = [...solicitudes].sort((a, b) => {
    if (filtroActivo === "fecha")    {
      const [dA, mA, yA] = a.fecha_solicitud.split("/");
      const [dB, mB, yB] = b.fecha_solicitud.split("/");
      return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
    }
    if (filtroActivo === "curso")    return a.nombre_curso.localeCompare(b.nombre_curso);
    if (filtroActivo === "empleado") return a.nombre_empleado.localeCompare(b.nombre_empleado);
    return 0;
  });

  // ==============================
  // MATRICULAR EMPLEADO
  // PATCH /cursos/inscripciones/:id/matricular — notifica al empleado.
  // ==============================
  const handleMatricular = async (solicitud) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/cursos/inscripciones/${solicitud.id}/matricular`,
        { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } }
      );

      const data = await res.json();

      if (res.ok) {
        setSolicitudes(prev => prev.filter(s => s.id !== solicitud.id));
        if (expandida === solicitud.id) setExpandida(null);
        alert("✓ Empleado matriculado. Fue notificado.");
      } else {
        alert(data.error || data.mensaje || "Error al matricular.");
      }
    } catch (err) {
      console.error("Error al matricular:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  // ==============================
  // DECLINAR MATRÍCULA
  // PATCH /cursos/inscripciones/:id/declinar — notifica al empleado.
  // ==============================
  const handleDeclinar = async (solicitud) => {
    const confirmar = window.confirm("¿Seguro que quieres declinar esta solicitud?");
    if (!confirmar) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:3000/cursos/inscripciones/${solicitud.id}/declinar`,
        { method: "PATCH", headers: { "Authorization": `Bearer ${token}` } }
      );

      const data = await res.json();

      if (res.ok) {
        setSolicitudes(prev => prev.filter(s => s.id !== solicitud.id));
        if (expandida === solicitud.id) setExpandida(null);
        alert("Solicitud declinada. El empleado fue notificado.");
      } else {
        alert(data.error || data.mensaje || "Error al declinar.");
      }
    } catch (err) {
      console.error("Error al declinar:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="admin-inscripciones-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>SOLICITUDES<br />DE INSCRIPCIÓN</h1>
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

        {/* Badge contador pendientes */}
        {!cargandoSolicitud && solicitudes.length > 0 && (
          <div className="admin-badge-pendientes">
            {solicitudes.length} pendiente{solicitudes.length !== 1 ? "s" : ""} de revisión
          </div>
        )}

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
                FECHA DE SOLICITUD
              </button>
              <button
                className={`filtro-opcion ${filtroActivo === "curso" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "curso" ? null : "curso"); setFiltroAbierto(false); }}
              >
                TIPO DE CURSO (A-Z)
              </button>
              <button
                className={`filtro-opcion ${filtroActivo === "empleado" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "empleado" ? null : "empleado"); setFiltroAbierto(false); }}
              >
                EMPLEADO (A-Z)
              </button>
            </div>
          )}
        </div>

        {/* LISTA DE SOLICITUDES */}
        <div className="inscripcion-lista">
          {cargandoSolicitud ? (
            <span className="loading-text">Cargando solicitudes...</span>
          ) : solicitudesFiltradas.length === 0 ? (
            <p className="sin-solicitudes">No hay solicitudes pendientes. 🎉</p>
          ) : (
            solicitudesFiltradas.map(sol => (
              <div key={sol.id} className="inscripcion-card">

                {/* Fila principal — click para expandir */}
                <div
                  className={`inscripcion-fila ${expandida === sol.id ? "expandida" : ""}`}
                  onClick={() => setExpandida(expandida === sol.id ? null : sol.id)}
                >
                  <div className="inscripcion-info">
                    <span className="inscripcion-empleado">{sol.nombre_empleado}</span>
                    <span className="inscripcion-curso">CURSO DE {sol.nombre_curso}</span>
                  </div>
                  <span className="inscripcion-arrow">{expandida === sol.id ? "▲" : "▼"}</span>
                </div>

                {/* Panel expandido */}
                {expandida === sol.id && (
                  <div className="inscripcion-detalle">

                    {/* Datos de la solicitud */}
                    <div className="inscripcion-datos">
                      <p><strong>Empleado:</strong> {sol.nombre_empleado}</p>
                      <p><strong>Curso:</strong> {sol.nombre_curso}</p>
                      <p><strong>Tipo:</strong> {sol.tipo_curso}</p>
                      <p><strong>Inicio del curso:</strong> {sol.fecha_inicio}</p>
                      <p><strong>Fecha de solicitud:</strong> {sol.fecha_solicitud}</p>
                    </div>

                    {/* Botones de acción */}
                    <div className="inscripcion-acciones">
                      <button
                        className="btn-matricular"
                        onClick={(e) => { e.stopPropagation(); handleMatricular(sol); }}
                      >
                        ✓ MATRICULAR
                      </button>
                      <button
                        className="btn-declinar"
                        onClick={(e) => { e.stopPropagation(); handleDeclinar(sol); }}
                      >
                        ✕ DECLINAR
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

export default AdminInscripciones;