// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./104.css";

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
// UTILIDAD — FORMATO DE PESOS
// ==============================
function formatearPesos(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CO");
}

// ==============================
// COMPONENTE NÓMINA
// ==============================
function Nomina() {
  const navigate = useNavigate();

  const [menuAbierto,    setMenuAbierto]    = useState(false);
  const [cargando,       setCargando]       = useState(true);
  const [error,          setError]          = useState(null);
  const [cargandoNomina, setCargandoNomina] = useState(true);

  const [usuario,      setUsuario]      = useState({ nombre: "", foto: "", rol: "" });
  const [botones,      setBotones]      = useState([]);
  const [nominas,      setNominas]      = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  // Saber si el usuario es admin para mostrarle el botón de enviar nómina
  const esAdmin = usuario.rol === "Administrador" || usuario.rol === "Supervisor";

  // ==============================
  // USE EFFECT INICIAL
  // ==============================
  useEffect(() => {
    document.title = "NÓMINA";
    const token = localStorage.getItem("token");

    // ── Cargar sesión ──────────────────────────────────────────
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
        setError("No se pudo verificar la sesión.");
      } finally {
        setCargando(false);
      }
    };

    // ── Cargar nóminas ─────────────────────────────────────────
    // GET /nomina  →  el backend ya devuelve SOLO el envío más
    // reciente por cada mes/año.
    const cargarNominas = async () => {
      try {
        setCargandoNomina(true);

        const resNomina = await fetch("http://localhost:3000/nomina", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (resNomina.ok) {
          const data = await resNomina.json();
          setNominas(data);
        } else {
          throw new Error("Respuesta no OK del servidor.");
        }

      } catch (err) {
        console.error("Error al cargar nóminas:", err);
        setNominas([]);
      } finally {
        setCargandoNomina(false);
      }
    };

    cargarDatos();
    cargarNominas();
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

  // ── Ordenar según filtro activo ────────────────────────────
  const nominasFiltradas = [...nominas].sort((a, b) => {
    if (filtroActivo === "reciente")       return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "antigua")        return new Date(a.fecha) - new Date(b.fecha);
    if (filtroActivo === "bonos-mayor")    return b.bonos - a.bonos;
    if (filtroActivo === "bonos-menor")    return a.bonos - b.bonos;
    return 0;
  });

  const toggleSeleccion  = (id) => setSeleccionados(prev =>
    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
  );
  const estaSeleccionado = (id) => seleccionados.includes(id);

  const handleDescargar = () => {
    if (seleccionados.length === 0) {
      alert("Selecciona al menos una nómina para descargar.");
      return;
    }
    seleccionados.forEach(id => {
      const nomina = nominas.find(n => n.id === id);
      if (!nomina) return;
      const link = document.createElement("a");
      link.href = nomina.ruta_pdf;
      link.download = `nomina-${nomina.mes.toLowerCase()}-${nomina.anio}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="nomina-page">

      <div className="circuloFondo"></div>

      {/* Título */}
      <div className="title">
        <h1>NOMINA</h1>
      </div>

      {/* Botón regresar */}
      <button className="back-btn-104" onClick={() => navigate(-1)}>←</button>

      {/* HEADER */}
      <header className="header-content">
        <img
          src={menuIcon}
          alt="Menu"
          className="icon-btn"
          onClick={() => setMenuAbierto(true)}
        />
        <img
          src={bellIcon}
          alt="Notificaciones"
          className="icon-btn"
          onClick={() => navigate("/500")}
        />
      </header>

      {/* NAV HORIZONTAL */}
      <nav className="nav-horizontal">
        {cargando ? (
          <span className="loading-text">Cargando...</span>
        ) : (
          botonesHeader.map(btn => (
            <button
              key={btn.id}
              className={btn.link === "/104" ? "active" : ""}
              onClick={() => navigate(btn.link)}
            >
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="nomina-main">
        {error && <p className="error-msg">{error}</p>}

        {/* BOTÓN ADMIN — ENVIAR NÓMINA */}
        {esAdmin && (
          <button
            className="btn-enviar-nomina-admin"
            onClick={() => navigate("/118-A")}
          >
            + ENVIAR NÓMINA A UN EMPLEADO
          </button>
        )}

        {/* FILTRO */}
        <div className="filtro-wrapper nomina-filtro-wrapper" ref={filtroRef}>
          <button
            className={`filtro-btn ${filtroActivo ? "activo" : ""}`}
            onClick={() => setFiltroAbierto(prev => !prev)}
          >
            FILTRAR POR
            <span className="filtro-icono nomina-filtro-icono">▼</span>
          </button>

          {filtroAbierto && (
            <div className="filtro-dropdown nomina-filtro-dropdown">
              {[
                { key: "reciente",    label: "MAS RECIENTE"                  },
                { key: "antigua",     label: "MAS ANTIGUA"                   },
                { key: "bonos-mayor", label: "VALOR DE BONOS MAYOR A MENOR"  },
                { key: "bonos-menor", label: "VALOR DE BONOS MENOR A MAYOR"  },
              ].map(op => (
                <button
                  key={op.key}
                  className={`filtro-opcion ${filtroActivo === op.key ? "seleccionada" : ""}`}
                  onClick={() => {
                    setFiltroActivo(filtroActivo === op.key ? null : op.key);
                    setFiltroAbierto(false);
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LISTA DE NÓMINAS */}
        <div className="nomina-lista">
          {cargandoNomina ? (
            <span className="loading-text">Cargando nómina...</span>
          ) : nominasFiltradas.length === 0 ? (
            <p className="sin-nominas">No hay registros de nómina disponibles.</p>
          ) : (
            nominasFiltradas.map(nomina => (
              <div
                key={nomina.id}
                className={`nomina-item ${estaSeleccionado(nomina.id) ? "seleccionado" : ""}`}
                onClick={() => toggleSeleccion(nomina.id)}
              >
                {/* Radio */}
                <span className={`nomina-radio ${estaSeleccionado(nomina.id) ? "marcado" : ""}`}></span>

                {/* Contenido del mes */}
                <div className="nomina-item-content">
                  <span className="nomina-mes">{nomina.mes} {nomina.anio}</span>

                  <div className="nomina-fila">
                    <span className="nomina-label">SALARIO</span>
                    <span className="nomina-puntos"></span>
                    <span className="nomina-valor">{formatearPesos(nomina.salario)}</span>
                  </div>
                  <div className="nomina-fila">
                    <span className="nomina-label">BONOS</span>
                    <span className="nomina-puntos"></span>
                    <span className="nomina-valor">{formatearPesos(nomina.bonos)}</span>
                  </div>
                  <div className="nomina-fila">
                    <span className="nomina-label">DEDUCCIONES</span>
                    <span className="nomina-puntos"></span>
                    <span className="nomina-valor">{formatearPesos(nomina.deducciones)}</span>
                  </div>
                  <div className="nomina-fila nomina-fila-total">
                    <span className="nomina-label">TOTAL DEL PAGO</span>
                    <span className="nomina-puntos"></span>
                    <span className="nomina-valor">{formatearPesos(nomina.total)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BOTÓN DESCARGAR */}
        <button
          className={`btn-descargar nomina-btn-descargar ${seleccionados.length > 0 ? "activo" : ""}`}
          onClick={handleDescargar}
        >
          DESCARGAR
        </button>
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
      <div className="nomina-decor-3"></div>

    </div>
  );
}

export default Nomina;