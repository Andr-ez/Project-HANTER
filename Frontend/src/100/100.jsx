// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./100.css";

// Íconos
import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";
import ToggleDarkMode from "../components/ToggleDarkMode";

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

      {/* Botón padre */}
      <button
        className={`sidebar-btn ${tieneHijos ? "tiene-hijos" : ""} ${abierto ? "abierto" : ""}`}
        onClick={handleClick}
      >
        <span>{btn.nombre}</span>
        {tieneHijos && (
          <span className={`sidebar-arrow ${abierto ? "rotado" : ""}`}>›</span>
        )}
      </button>

      {/* Sub-botones hijos */}
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
// COMPONENTE INICIO
// ==============================
function Inicio() {
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
    document.title = "INICIO";

    const cargarDatos = async () => {
      try {
        setCargando(true);

        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/001");
          return;
        }

        const response = await fetch("http://localhost:3000/auth/sesion", {
           headers: {
          "Authorization": `Bearer ${token}`
        }
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
        setUsuario({ nombre: "Jaime Antonio Marin ", foto: null, rol: "ADMINISTRADOR" });
        setBotones([
          { id: 1, nombre: "INICIO",         link: "/100",        posicion: ["header", "sidebar"], hijos: [] },
          { id: 2, nombre: "CERTIFICADOS",   link: "/101",      posicion: ["header", "sidebar"], hijos: [] },
          { id: 3, nombre: "NOMINA",         link: "/104",     posicion: ["header", "sidebar"], hijos: [] },
          { id: 4, nombre: "CAPACITACIONES", link: "/125",       posicion: ["header", "sidebar"], hijos: [] },
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

  // Filtros según posición
  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="inicio-page">

      {/* Círculo Fondo Superior */}
      <div className="circuloFondo"></div>

      {/* Título */}
      <div className="title">
        <h1>INICIO</h1>
      </div>

      {/* HEADER */}
      <header className="header-content">
        <img
          src={menuIcon}
          alt="Menu"
          className="icon-btn"
          onClick={() => setMenuAbierto(true)}
        />
        <img src={bellIcon} alt="Notificaciones" className="icon-btn" onClick={() => navigate("/500")} style={{ cursor: "pointer" }} />
      </header>
        
      {/* NAV HORIZONTAL — botones con posición "header" */}
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="main-content">
        {error && <p className="error-msg">{error}</p>}

        {/* ¿Qué es Hanter? */}
        <section className="info-section">
          <h2 className="section-title">¿QUÉ ES HANTER?</h2>
          <p className="section-text">
            Es una aplicación web diseñada como un sistema de gestión integral de empleados 
            y generación de certificados. Su propósito principal es permitir que las empresas 
            mantengan una base de datos sólida y ordenada de sus colaboradores para agilizar 
            procesos administrativos, como la creación de distintos tipos de certificados laborales.
          </p>
        </section>

        {/* ¿Quién lo desarrolla? */}
        <section className="info-section">
          <h2 className="section-title">¿QUIÉN LO DESARROLLA?</h2>
          <p className="section-text">
            El proyecto es desarrollado por un equipo de aprendices del SENA (Servicio Nacional de
            Aprendizaje) dentro del programa de Análisis y Desarrollo de Software.
          </p>
          <ul className="team-list">
            <li>Jorge Andrés Velásquez Villar</li>
            <li>Jaime Antonio Marín Barrientos</li>
            <li>Rosa Elizabeth Castillo Vásquez</li>
          </ul>
        </section>

        {/* ¿Qué soluciones ofrece? */}
        <section className="info-section">
          <h2 className="section-title">¿QUÉ SOLUCIONES OFRECE?</h2>
          <p className="section-text">
            La plataforma busca resolver problemas de desorganización administrativa mediante las
            siguientes funcionalidades:
          </p>
          <ul className="solutions-list">
            <li>
              <span className="list-label">Gestión de Certificados:</span> Permite guardar y descargar
              certificados para cada empleado de forma rápida.
            </li>
            <li>
              <span className="list-label">Administración de Personal:</span> Registro y control de
              datos personales y laborales (nombres, cargos, nóminas, capacitaciones y certificados de
              estudios).
            </li>
            <li>
              <span className="list-label">Panel Administrativo (RRHH):</span> Herramientas exclusivas
              para que el personal de Recursos Humanos gestione empleados, asigne roles y genere
              reportes.
            </li>
            <li>
              <span className="list-label">Gestión de Capacitaciones:</span> Seguimiento de cursos
              realizados y certificados de estudio obtenidos por el personal.
            </li>
            <li>
              <span className="list-label">Seguridad y Soporte:</span> Incluye módulos para
              recuperación de contraseñas, edición de perfil y contacto con soporte técnico.
            </li>
          </ul>
        </section>

        {/* Tecnologías */}
        <section className="info-section">
          <h2 className="section-title">TECNOLOGÍAS DEL SISTEMA</h2>
          <ul className="solutions-list">
            <li>
              <span className="list-label">Lenguajes de Programación usados:</span>  JavaScript con Node.js 
              y Express (para la lógica de negocio y la API principal), Java con Spring Boot (para el módulo 
              de generación de certificados), HTML, React.js y CSS (para la interfaz visual).
            </li>
            <li>
              <span className="list-label">Base de Datos:</span> SQLite, gestionada mediante el ORM Prisma, 
              con un esquema relacional estructurado que define entidades como Empleado, Usuario, Rol, 
              Certificado y Capacitación.
            </li>
            <li>
              <span className="list-label">Estándares de Calidad:</span>El diseño contempla normativas 
              como la ISO 25010 y el GDPR para asegurar que la plataforma sea intuitiva y proteja los datos 
              sensibles de los usuarios.
            </li>
          </ul>
        </section>

        {/* Otros aspectos */}
        <section className="info-section">
          <h2 className="section-title">OTROS ASPECTOS IMPORTANTES</h2>
          <ul className="solutions-list">
            <li>
              <span className="list-label">Metodología Ágil:</span> El proyecto se desarrolla bajo
              marcos de trabajo ágiles (Scrum), lo que permite adaptarse rápidamente a los cambios y
              necesidades del cliente final.
            </li>
            <li>
              <span className="list-label">Diseño de Experiencia (UX/UI):</span> Se utilizó Figma como
              herramienta principal de prototipado para asegurar que la navegación sea lógica,
              jerárquica y fácil de usar.
            </li>
            <li>
              <span className="list-label">Estándares de Código:</span> El equipo sigue reglas 
              estrictas de codificación (como nombres en camelCase para Java y JavaScript, o 
              kebab-case para CSS) para garantizar que el software sea profesional, fácil de 
              mantener y escalable a futuro.
            </li>
          </ul>
        </section>

      </main>

      {/* SIDEBAR — botones con posición "sidebar" */}
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

      {menuAbierto && (
        <div className="overlay" onClick={() => setMenuAbierto(false)} />
      )}

      {/* Decoraciones */}
      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>

    </div>
  );
}

export default Inicio;

