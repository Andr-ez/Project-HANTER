// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./101.css";

// Íconos
import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";

// ==============================
// COMPONENTE — BOTÓN CON HIJOS (igual que 100)
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
// COMPONENTE CERTIFICADOS
// ==============================
function Certificados() {
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState(null);

  const [usuario, setUsuario] = useState({ nombre: "", foto: "", rol: "" });
  const [botones, setBotones] = useState([]);

  // ==============================
  // USE EFFECT INICIAL
  // ==============================
  useEffect(() => {
    document.title = "CERTIFICADOS";

    const cargarDatos = async () => {
      try {
        setCargando(true);

        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/auth/sesion", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
          navigate("/001");
          return;
        }

        const data = await response.json();
        setUsuario({
          nombre: data.usuario.nombre,
          foto:   data.usuario.foto || null,
          rol:    data.usuario.rol
        });
        setBotones(data.botones);

      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError(".");

        // Fallback mientras se desarrolla
        setUsuario({ nombre: "Jaime Antonio Marin", foto: null, rol: "ADMINISTRADOR" });
        setBotones([
          { id: 1, nombre: "INICIO",         link: "/100",    posicion: ["header", "sidebar"], hijos: [] },
          { id: 2, nombre: "CERTIFICADOS",   link: "/101",  posicion: ["header", "sidebar"], hijos: [] },
          { id: 3, nombre: "NOMINA",         link: "/104", posicion: ["header", "sidebar"], hijos: [] },
          { id: 4, nombre: "CAPACITACIONES", link: "/125",   posicion: ["header", "sidebar"], hijos: [] },
          {
            id: 5,
            nombre: "BENEFICIOS",
            link: null,
            posicion: ["sidebar"],
            hijos: [
              { id: 51, nombre: "VISUALIZAR",   link: "/crono/general"   },
              { id: 52, nombre: "SOLICITAR", link: "/crono/induccion" },
            ]
          },
          { id: 7, nombre: "CONFIGURACIÓN", link: "/config",     posicion: ["sidebar"], hijos: [] },
        ]);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="certificados-page">

      {/* Círculo Fondo */}
      <div className="circuloFondo"></div>

      {/* Título */}
      <div className="title">
        <h1>CERTIFICADOS</h1>
      </div>

      {/* HEADER */}
      <header className="header-content">
        <img
          src={menuIcon}
          alt="Menu"
          className="icon-btn"
          onClick={() => setMenuAbierto(true)}
        />
        <img src={bellIcon} alt="Notificaciones" className="icon-btn" />
      </header>

      {/* NAV HORIZONTAL */}
      <nav className="nav-horizontal">
        {cargando ? (
          <span className="loading-text">Cargando...</span>
        ) : (
          botonesHeader.map(btn => (
            <button
              key={btn.id}
              className={btn.link === "/certs" ? "active" : ""}
              onClick={() => navigate(btn.link)}
            >
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      {/* CONTENIDO PRINCIPAL — Botones de certificados */}
      <main className="main-content">
        {error && <p className="error-msg">{error}</p>}

        <div className="cert-botones">
          <button
             className="cert-btn"
             onClick={() => navigate("/102")}
          >
            AÑADIR<br />CERTIFICADO
          </button>

          <button className="cert-btn" onClick={() => navigate("/103")}>
            BUSCAR<br />CERTIFICADO
          </button>
        </div>
      </main>

      {/* SIDEBAR */}
      <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
        <button className="close-btn-sidebar" onClick={() => setMenuAbierto(false)}>
          ←
        </button>

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

      {menuAbierto && (
        <div className="overlay" onClick={() => setMenuAbierto(false)} />
      )}

      {/* Decoraciones */}
      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>

    </div>
  );
}

export default Certificados;