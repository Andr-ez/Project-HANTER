// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./125-A.css";

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
// TIPOS DE CURSO DISPONIBLES
// ==============================
const TIPOS_CURSO = [
  "HERRAMIENTAS OFIMÁTICAS",
  "HABILIDADES BLANDAS",
  "TECNOLOGÍA",
  "IDIOMAS",
  "ADMINISTRACIÓN",
  "SALUD Y SEGURIDAD",
];

// ==============================
// COMPONENTE ADMIN — CREAR CURSO
// Solo disponible para administradores.
// Permite agregar un nuevo curso que los empleados verán en la página 126.
// ==============================
function AdminCrearCurso() {
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState(null);

  const [usuario, setUsuario] = useState({ nombre: "", foto: "", rol: "" });
  const [botones, setBotones] = useState([]);

  // Campos del formulario
  const [nombre,      setNombre]      = useState("");
  const [tipo,        setTipo]        = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [exito,    setExito]    = useState(false);

  // ==============================
  // USE EFFECT INICIAL
  // ==============================
  useEffect(() => {
    document.title = "ADMIN — CREAR CURSO";

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const resSesion = await fetch("http://localhost:3000/auth/sesion", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!resSesion.ok) { navigate("/001"); return; }

        const dataSesion = await resSesion.json();

        // Solo administradores pueden entrar a esta página
        if (dataSesion.usuario.rol !== "Administrador" && dataSesion.usuario.rol !== "Supervisor") {
          navigate("/125");
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

    cargarDatos();
  }, [navigate]);

  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  // ==============================
  // CREAR CURSO
  // ==============================
  const handleCrearCurso = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !tipo || !fechaInicio) {
      alert("Completa el nombre, el tipo y la fecha de inicio del curso.");
      return;
    }

    setEnviando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/cursos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre:       nombre.trim(),
          tipo,
          fecha_inicio: fechaInicio,   // formato YYYY-MM-DD del input date
          descripcion:  descripcion.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setExito(true);
        setNombre("");
        setTipo("");
        setFechaInicio("");
        setDescripcion("");
      } else {
        alert(data.error || "Error al crear el curso.");
      }
    } catch (err) {
      console.error("Error al crear curso:", err);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="admin-crear-curso-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>AGREGAR<br />NUEVO CURSO</h1>
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

        {!exito ? (
          <form className="curso-form" onSubmit={handleCrearCurso}>

            <label className="curso-label">
              NOMBRE DEL CURSO
              <input
                type="text"
                className="curso-input"
                placeholder="Ej: Excel Avanzado"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </label>

            <label className="curso-label">
              TIPO DE CURSO
              <select
                className="curso-input"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="">Selecciona un tipo...</option>
                {TIPOS_CURSO.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="curso-label">
              FECHA DE INICIO
              <input
                type="date"
                className="curso-input"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </label>

            <label className="curso-label">
              DESCRIPCIÓN (OPCIONAL)
              <textarea
                className="curso-textarea"
                placeholder="Breve descripción del curso..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </label>

            <button type="submit" className="curso-submit-btn" disabled={enviando}>
              {enviando ? "CREANDO..." : "CREAR CURSO"}
            </button>
          </form>
        ) : (
          <div className="curso-exito">
            <div className="curso-exito-icono">✓</div>
            <p className="curso-exito-titulo">¡CURSO CREADO!</p>
            <p className="curso-exito-texto">
              El curso ya está disponible para que los empleados se inscriban.
            </p>
            <div className="curso-exito-acciones">
              <button className="curso-submit-btn" onClick={() => setExito(false)}>
                CREAR OTRO
              </button>
              <button
                className="curso-submit-btn secundario"
                onClick={() => navigate("/126-A")}
              >
                VER SOLICITUDES
              </button>
            </div>
          </div>
        )}
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

export default AdminCrearCurso;