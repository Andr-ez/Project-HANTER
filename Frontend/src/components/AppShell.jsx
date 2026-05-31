// ============================================================
// AppShell — layout compartido de todas las páginas internas.
//
// Incluye:
//   • Header (ícono de menú + campana)
//   • Nav horizontal (botones con posición "header")
//   • Sidebar deslizable (botones con posición "sidebar",
//     info del usuario y toggle de modo oscuro)
//   • Overlay que cierra el sidebar al hacer clic fuera
//   • Círculo de fondo y decoraciones opcionales
//
// Props:
//   title        (string)    — Texto del <h1> de la página
//   usuario      (object)    — { nombre, foto, rol }
//   botones      (array)     — Del endpoint /auth/sesion
//   cargando     (boolean)   — Muestra "Cargando..." en el nav
//   linkActivo   (string)    — Link del botón que debe marcarse
//                              como activo en el nav horizontal
//   children                 — Contenido del <main>
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ToggleDarkMode from "./ToggleDarkMode";

import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";

// ── Botón del sidebar con soporte para sub-ítems ─────────────
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

// ── Componente principal ──────────────────────────────────────
export default function AppShell({
  title,
  usuario,
  botones,
  cargando,
  linkActivo,
  children,
}) {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  return (
    <>
      {/* Círculo de fondo */}
      <div className="circuloFondo"></div>

      {/* Título */}
      <div className="title">
        <h1>{title}</h1>
      </div>

      {/* Header */}
      <header className="header-content">
        <img
          src={menuIcon}
          alt="Menú"
          className="icon-btn"
          onClick={() => setMenuAbierto(true)}
        />
        <img
          src={bellIcon}
          alt="Notificaciones"
          className="icon-btn"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/500")}
        />
      </header>

      {/* Nav horizontal */}
      <nav className="nav-horizontal">
        {cargando ? (
          <span className="loading-text">Cargando...</span>
        ) : (
          botonesHeader.map(btn => (
            <button
              key={btn.id}
              className={linkActivo && btn.link === linkActivo ? "active" : ""}
              onClick={() => navigate(btn.link)}
            >
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      {/* Contenido principal */}
      <main className="main-content">
        {children}
      </main>

      {/* Sidebar */}
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

        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <ToggleDarkMode />
        </div>
      </aside>

      {/* Overlay */}
      {menuAbierto && (
        <div className="overlay" onClick={() => setMenuAbierto(false)} />
      )}

      {/* Decoraciones */}
      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>
    </>
  );
}