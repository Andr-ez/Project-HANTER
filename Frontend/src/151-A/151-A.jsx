// ==============================
// 151-A — GESTIÓN DE CURSOS DE USUARIOS  (uso exclusivo de admins)
// Permite al admin ver las inscripciones activas de los empleados
// y actualizar su avance: marcarlas EN PROGRESO o COMPLETADO.
// Consume las rutas de /cursos/inscripciones del backend
// (activas + cambio de estado), que ya estaban listas para conectar.
// ==============================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./151-A.css";

// Íconos
import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";

const API = "http://localhost:3000";

// ==============================
// COMPONENTE — BOTÓN DEL SIDEBAR CON HIJOS
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
              onClick={() => { cerrarMenu(); navigate(hijo.link); }}
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

// Texto legible para cada estado de la inscripción.
const ETIQUETA_ESTADO = {
  MATRICULADO: "Matriculado",
  EN_PROGRESO: "En progreso",
  COMPLETADO:  "Completado"
};

// ==============================
// COMPONENTE PRINCIPAL
// ==============================
function AdminCursosUsuarios() {
  const navigate = useNavigate();

  const [menuAbierto,   setMenuAbierto]   = useState(false);
  const [cargando,      setCargando]      = useState(true);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error,         setError]         = useState(null);

  const [usuario, setUsuario] = useState({ nombre: "", foto: "", rol: "" });
  const [botones, setBotones] = useState([]);

  const [inscripciones, setInscripciones] = useState([]);
  const [expandida,     setExpandida]     = useState(null);

  // ==============================
  // CARGA INICIAL
  // ==============================
  useEffect(() => {
    document.title = "ADMIN — CURSOS DE USUARIOS";
    const token = localStorage.getItem("token");

    const cargarSesion = async () => {
      try {
        setCargando(true);
        const res = await fetch(`${API}/auth/sesion`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) { navigate("/001"); return; }

        const data = await res.json();

        // Solo administradores/supervisores pueden ver esta página.
        if (data.usuario.rol !== "Administrador" && data.usuario.rol !== "Supervisor") {
          navigate("/100");
          return;
        }

        setUsuario({
          nombre: data.usuario.nombre,
          foto:   data.usuario.foto || null,
          rol:    data.usuario.rol
        });
        setBotones(data.botones);
      } catch (err) {
        console.error("Error al cargar sesión:", err);
        setError(".");
        setUsuario({ nombre: "Admin HANTER", foto: null, rol: "ADMINISTRADOR" });
        setBotones([
          { id: 1, nombre: "INICIO",         link: "/100", posicion: ["header", "sidebar"], hijos: [] },
          { id: 2, nombre: "CERTIFICADOS",   link: "/101", posicion: ["header", "sidebar"], hijos: [] },
          { id: 3, nombre: "NOMINA",         link: "/104", posicion: ["header", "sidebar"], hijos: [] },
          { id: 4, nombre: "CAPACITACIONES", link: "/125", posicion: ["header", "sidebar"], hijos: [] },
          { id: 7, nombre: "CONFIGURACIÓN",  link: "/config", posicion: ["sidebar"], hijos: [] },
        ]);
      } finally {
        setCargando(false);
      }
    };

    cargarSesion();
    cargarInscripciones();
  }, [navigate]);

  // ==============================
  // GET /cursos/inscripciones/activas
  // Trae las inscripciones MATRICULADO / EN_PROGRESO / COMPLETADO.
  // ==============================
  const cargarInscripciones = async () => {
    try {
      setCargandoLista(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/cursos/inscripciones/activas`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Respuesta no OK");
      const data = await res.json();
      setInscripciones(data);
    } catch (err) {
      console.error("Error al cargar inscripciones:", err);
      setInscripciones([]);
    } finally {
      setCargandoLista(false);
    }
  };

  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  // ==============================
  // PATCH /cursos/inscripciones/:id/estado
  // Actualiza el avance del curso del empleado y lo notifica.
  // ==============================
  const cambiarEstado = async (insc, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API}/cursos/inscripciones/${insc.id}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ estado: nuevoEstado })
        }
      );
      const data = await res.json();

      if (res.ok) {
        alert(
          nuevoEstado === "COMPLETADO"
            ? "✓ Curso marcado como completado. El empleado fue notificado."
            : "✓ Curso marcado como en progreso. El empleado fue notificado."
        );
        cargarInscripciones();
      } else {
        alert(data.error || "Error al actualizar el estado.");
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="admin-cursos-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>CURSOS<br />DE USUARIOS</h1>
      </div>

      <button className="back-btn-151A" onClick={() => navigate("/150-A")}>←</button>

      <header className="header-content">
        <img src={menuIcon} alt="Menu" className="icon-btn" onClick={() => setMenuAbierto(true)} />
        <img src={bellIcon} alt="Notificaciones" className="icon-btn" onClick={() => navigate("/500")} />
      </header>

      <nav className="nav-horizontal">
        {cargando ? (
          <span className="loading-text">Cargando...</span>
        ) : (
          botonesHeader.map(btn => (
            <button key={btn.id} onClick={() => navigate(btn.link)}>
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      <main className="main-content">
        {error && <p className="error-msg">{error}</p>}

        <p className="cursos-subtitulo">
          Actualiza el avance de los cursos de cada empleado.
        </p>

        {/* Lista de inscripciones activas */}
        <div className="cursos-lista">
          {cargandoLista ? (
            <span className="loading-text">Cargando cursos...</span>
          ) : inscripciones.length === 0 ? (
            <p className="sin-cursos">No hay cursos activos de usuarios.</p>
          ) : (
            inscripciones.map(insc => (
              <div key={insc.id} className="curso-card">

                {/* Fila principal */}
                <div
                  className={`curso-fila ${expandida === insc.id ? "expandida" : ""}`}
                  onClick={() => setExpandida(expandida === insc.id ? null : insc.id)}
                >
                  <div className="curso-info">
                    <span className="curso-empleado">{insc.nombre_empleado}</span>
                    <span className="curso-nombre">CURSO DE {insc.nombre_curso}</span>
                  </div>
                  <span className={`curso-estado-badge estado-${insc.estado}`}>
                    {ETIQUETA_ESTADO[insc.estado] || insc.estado}
                  </span>
                  <span className="curso-arrow">
                    {expandida === insc.id ? "▲" : "▼"}
                  </span>
                </div>

                {/* Panel expandido */}
                {expandida === insc.id && (
                  <div className="curso-detalle">

                    <div className="curso-datos">
                      <p><strong>Empleado:</strong> {insc.nombre_empleado}</p>
                      <p><strong>Curso:</strong> {insc.nombre_curso}</p>
                      <p><strong>Inicio del curso:</strong> {insc.fecha_inicio}</p>
                      <p><strong>Estado actual:</strong> {ETIQUETA_ESTADO[insc.estado] || insc.estado}</p>
                    </div>

                    {/* Botones de cambio de estado */}
                    <div className="curso-acciones">
                      <button
                        className="btn-en-progreso"
                        disabled={insc.estado === "EN_PROGRESO"}
                        onClick={(e) => { e.stopPropagation(); cambiarEstado(insc, "EN_PROGRESO"); }}
                      >
                        ⟳ EN PROGRESO
                      </button>
                      <button
                        className="btn-completado"
                        disabled={insc.estado === "COMPLETADO"}
                        onClick={(e) => { e.stopPropagation(); cambiarEstado(insc, "COMPLETADO"); }}
                      >
                        ✓ COMPLETADO
                      </button>
                    </div>

                  </div>
                )}

              </div>
            ))
          )}
        </div>
      </main>

      {/* SIDEBAR */}
      <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
        <button className="close-btn-sidebar" onClick={() => setMenuAbierto(false)}>←</button>
        <div className="user-info-sidebar">
          <div>
            <span style={{ display: "block", fontSize: "14px" }}>
              {cargando ? "Cargando..." : usuario.nombre}
            </span>
            <span style={{ display: "block", fontSize: "11px", opacity: 0.7 }}>
              {usuario.rol}
            </span>
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
            <SidebarBtn
              key={btn.id}
              btn={btn}
              navigate={navigate}
              cerrarMenu={() => setMenuAbierto(false)}
            />
          ))}
        </nav>
      </aside>

      {menuAbierto && <div className="overlay" onClick={() => setMenuAbierto(false)} />}

      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>

    </div>
  );
}

export default AdminCursosUsuarios;