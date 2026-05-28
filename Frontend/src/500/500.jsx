// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./500.css";

// Íconos
import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";

// ==============================
// DATOS DE EJEMPLO (FALLBACK)
// Se usan mientras no hay backend de notificaciones.
// Cuando el backend esté listo, reemplazar con fetch real.
// ==============================

// Notificaciones de ejemplo para ADMINISTRADOR
const NOTIFICACIONES_ADMIN_EJEMPLO = [
  {
    id: 1,
    tipo: "certificado_pendiente",
    titulo: "Solicitud de certificado pendiente",
    mensaje:
      "El empleado Jaime Marín ha enviado una solicitud de certificado laboral que está pendiente de revisión y aprobación.",
    fecha: "2026-05-17T10:30:00",
    leida: false,
    ruta_destino: "/103-A",
    etiqueta_boton: "Revisar solicitud",
  },
  {
    id: 2,
    tipo: "inscripcion_pendiente",
    titulo: "Solicitud de inscripción a capacitación",
    mensaje:
      "Ana García solicita inscribirse al curso de Excel Avanzado. Aprueba o declina la solicitud.",
    fecha: "2026-05-16T14:15:00",
    leida: false,
    ruta_destino: "/126-A",
    etiqueta_boton: "Ver solicitud",
  },
  {
    id: 3,
    tipo: "certificado_pendiente",
    titulo: "Solicitud de certificado pendiente",
    mensaje:
      "Carlos Ruiz solicita un certificado de experiencia laboral. Pendiente de aprobación.",
    fecha: "2026-05-15T09:00:00",
    leida: true,
    ruta_destino: "/103-A",
    etiqueta_boton: "Revisar solicitud",
  },
  {
    id: 4,
    tipo: "inscripcion_pendiente",
    titulo: "Nueva solicitud de inscripción",
    mensaje:
      "María López quiere inscribirse al taller de Liderazgo Empresarial. Revisa los detalles.",
    fecha: "2026-05-14T16:45:00",
    leida: true,
    ruta_destino: "/126-A",
    etiqueta_boton: "Ver solicitud",
  },
];

// Notificaciones de ejemplo para EMPLEADO
const NOTIFICACIONES_EMPLEADO_EJEMPLO = [
  {
    id: 1,
    tipo: "certificado_aprobado",
    titulo: "¡Tu certificado fue aprobado!",
    mensaje:
      "Tu solicitud de certificado laboral ha sido revisada y aprobada por el administrador. Ya puedes descargarlo.",
    fecha: "2026-05-17T11:00:00",
    leida: false,
    ruta_destino: "/103",
    etiqueta_boton: "Ver certificado",
  },
  {
    id: 2,
    tipo: "inscripcion_aprobada",
    titulo: "Inscripción aprobada",
    mensaje:
      "Fuiste inscrito exitosamente al curso de Excel Avanzado. La capacitación comienza el 20 de mayo.",
    fecha: "2026-05-16T15:30:00",
    leida: false,
    ruta_destino: "/133",
    etiqueta_boton: "Ver historial",
  },
  {
    id: 3,
    tipo: "certificado_rechazado",
    titulo: "Certificado rechazado",
    mensaje:
      "Tu solicitud de certificado de experiencia fue rechazada. Puedes enviar una nueva solicitud con los documentos correctos.",
    fecha: "2026-05-14T10:20:00",
    leida: true,
    ruta_destino: "/102",
    etiqueta_boton: "Nueva solicitud",
  },
];

// ==============================
// HELPER — FORMATEAR FECHA
// ==============================
function formatearFecha(isoString) {
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ==============================
// HELPER — ICONO POR TIPO
// ==============================
function iconoPorTipo(tipo) {
  switch (tipo) {
    case "certificado_pendiente":  return "📄";
    case "inscripcion_pendiente":  return "📋";
    case "certificado_aprobado":   return "✅";
    case "certificado_rechazado":  return "❌";
    case "inscripcion_aprobada":   return "🎓";
    default:                       return "🔔";
  }
}

// ==============================
// HELPER — COLOR ACENTO POR TIPO
// ==============================
function colorPorTipo(tipo) {
  switch (tipo) {
    case "certificado_aprobado":  return "verde";
    case "inscripcion_aprobada":  return "verde";
    case "certificado_rechazado": return "rojo";
    default:                      return "azul";
  }
}

// ==============================
// COMPONENTE — BOTÓN SIDEBAR CON HIJOS
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

// ==============================
// COMPONENTE PRINCIPAL — NOTIFICACIONES
// ==============================
function Notificaciones() {
  const navigate = useNavigate();

  // Estados generales
  const [menuAbierto,       setMenuAbierto]       = useState(false);
  const [cargando,          setCargando]          = useState(true);

  // Datos de sesión
  const [usuario,  setUsuario]  = useState({ nombre: "", foto: "", rol: "" });
  const [botones,  setBotones]  = useState([]);

  // Notificaciones
  const [notificaciones,      setNotificaciones]      = useState([]);
  const [notificacionActiva,  setNotificacionActiva]  = useState(null); // detalle abierto

  // Filtro
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null); // "fecha" | "titulo"
  const filtroRef = useRef(null);

  // ==============================
  // CARGA INICIAL
  // ==============================
  useEffect(() => {
    document.title = "Notificaciones";

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");

        // --- SESIÓN DEL USUARIO ---
        const resSesion = await fetch("http://localhost:3000/auth/sesion", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resSesion.ok) { navigate("/001"); return; }

        const dataSesion = await resSesion.json();
        const rolUsuario = dataSesion.usuario.rol?.toLowerCase();

        setUsuario({
          nombre: dataSesion.usuario.nombre,
          foto:   dataSesion.usuario.foto || null,
          rol:    dataSesion.usuario.rol,
        });
        setBotones(dataSesion.botones);

        // --- NOTIFICACIONES DEL USUARIO (backend real) ---
        const resNotif = await fetch("http://localhost:3000/notificaciones", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resNotif.ok) {
          const dataNotif = await resNotif.json();
          // Mapear campos de la DB al formato que espera el frontend
          const mapeadas = dataNotif.map(n => ({
            id:             n.id_notificacion,
            tipo:           n.tipo           || "general",
            titulo:         n.titulo         || "Notificación",
            mensaje:        n.mensaje,
            fecha:          n.fecha_creacion,
            leida:          n.leida,
            ruta_destino:   n.ruta_destino   || null,
            etiqueta_boton: n.etiqueta_boton || "Ver más",
          }));
          setNotificaciones(mapeadas);
        }

      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
        // FALLBACK si el backend no responde
        setUsuario({ nombre: "Usuario Demo", foto: null, rol: "EMPLEADO" });
        setBotones([
          { id: 1, nombre: "INICIO",         link: "/100", hijos: [] },
          { id: 2, nombre: "CERTIFICADOS",   link: "/101", hijos: [] },
          { id: 3, nombre: "NOMINA",         link: "/104", hijos: [] },
          { id: 4, nombre: "CAPACITACIONES", link: "/125", hijos: [] },
        ]);
        setNotificaciones(NOTIFICACIONES_EMPLEADO_EJEMPLO);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [navigate]);

  // Cerrar filtro al hacer clic fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) {
        setFiltroAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  // ==============================
  // MARCAR COMO LEÍDA
  // ==============================
  const abrirNotificacion = async (notif) => {
    // Actualizar UI inmediatamente
    setNotificaciones(prev =>
      prev.map(n => n.id === notif.id ? { ...n, leida: true } : n)
    );
    setNotificacionActiva(notif);
    // Persistir en backend si no estaba leída
    if (!notif.leida) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:3000/notificaciones/${notif.id}/leer`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(err => console.error("Error al marcar notificación:", err));
    }
  };

  // ==============================
  // LISTA FILTRADA
  // ==============================
  const notificacionesFiltradas = [...notificaciones].sort((a, b) => {
    if (filtroActivo === "fecha") {
      return new Date(b.fecha) - new Date(a.fecha);
    }
    if (filtroActivo === "titulo") {
      return a.titulo.localeCompare(b.titulo);
    }
    // Default: no leídas primero, luego por fecha
    if (a.leida !== b.leida) return a.leida ? 1 : -1;
    return new Date(b.fecha) - new Date(a.fecha);
  });

  const cantidadNoLeidas = notificaciones.filter(n => !n.leida).length;

  // ==============================
  // VISTA: DETALLE DE NOTIFICACIÓN
  // ==============================
  if (notificacionActiva) {
    return (
      <div className="notif-page page">
        {/* Círculos decorativos */}
        <div className="circuloFondo circulo1" />
        <div className="circuloFondo circulo2" />

        {/* Botón volver al listado */}
        <button className="back-btn-500" onClick={() => setNotificacionActiva(null)}>
          ←
        </button>

        <div className="notif-detalle-wrapper">
          {/* Ícono y título */}
          <div className={`notif-detalle-icono acento-${colorPorTipo(notificacionActiva.tipo)}`}>
            <span>{iconoPorTipo(notificacionActiva.tipo)}</span>
          </div>

          <h2 className="notif-detalle-titulo">{notificacionActiva.titulo}</h2>

          <span className="notif-detalle-fecha">
            🕐 {formatearFecha(notificacionActiva.fecha)}
          </span>

          <div className="notif-detalle-cuerpo">
            <p>{notificacionActiva.mensaje}</p>
          </div>

          {/* Botón de acción */}
          <button
            className={`notif-btn-accion acento-${colorPorTipo(notificacionActiva.tipo)}`}
            onClick={() => navigate(notificacionActiva.ruta_destino)}
          >
            {notificacionActiva.etiqueta_boton} →
          </button>
        </div>
      </div>
    );
  }

  // ==============================
  // VISTA: LISTADO DE NOTIFICACIONES
  // ==============================
  return (
    <div className="notif-page page">
      {/* Círculos decorativos */}
      <div className="circuloFondo circulo1" />
      <div className="circuloFondo circulo2" />

      {/* ── BARRA SUPERIOR ── */}
      <div className="top-bar">
        <button className="back-btn-500" onClick={() => navigate(-1)}>←</button>

        <div className="top-bar-right">
          {/* Campana con badge de no leídas */}
          <div className="bell-wrapper">
            <img src={bellIcon} alt="notificaciones" className="top-icon" />
            {cantidadNoLeidas > 0 && (
              <span className="bell-badge">{cantidadNoLeidas}</span>
            )}
          </div>

  
        </div>
      </div>

      {/* ── TÍTULO ── */}
      <div className="title">
        <h1>NOTIFICACIONES</h1>
      </div>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="notif-main-content">

        {/* Saludo */}
        {!cargando && (
          <p className="notif-saludo">
            Hola <strong>{usuario.nombre}</strong>, estas son tus notificaciones
          </p>
        )}

        {/* Fila: badge no leídas + filtro */}
        <div className="notif-barra-acciones">
          {cantidadNoLeidas > 0 && (
            <span className="notif-badge-noLeidas">
              {cantidadNoLeidas} sin leer
            </span>
          )}

          <div className="notif-filtro-wrapper" ref={filtroRef}>
            <button
              className={`notif-filtro-btn ${filtroActivo ? "activo" : ""}`}
              onClick={() => setFiltroAbierto(prev => !prev)}
            >
              FILTRAR POR
              <span className="filtro-icono">▼</span>
            </button>

            {filtroAbierto && (
              <div className="notif-filtro-dropdown">
                <button
                  className={filtroActivo === "fecha" ? "seleccionado" : ""}
                  onClick={() => { setFiltroActivo("fecha"); setFiltroAbierto(false); }}
                >
                  📅 Fecha de notificación
                </button>
                <button
                  className={filtroActivo === "titulo" ? "seleccionado" : ""}
                  onClick={() => { setFiltroActivo("titulo"); setFiltroAbierto(false); }}
                >
                  🔤 Título (A-Z)
                </button>
                {filtroActivo && (
                  <button
                    className="limpiar-filtro"
                    onClick={() => { setFiltroActivo(null); setFiltroAbierto(false); }}
                  >
                    ✕ Quitar filtro
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── ESTADO: CARGANDO ── */}
        {cargando && (
          <div className="notif-estado">
            <div className="notif-spinner" />
            <p>Cargando notificaciones...</p>
          </div>
        )}

        {/* ── ESTADO: VACÍO ── */}
        {!cargando && notificaciones.length === 0 && (
          <div className="notif-estado vacio">
            <span className="notif-vacio-icono">🔕</span>
            <p className="notif-vacio-titulo">Sin notificaciones</p>
            <p className="notif-vacio-sub">No tienes notificaciones por el momento.</p>
          </div>
        )}

        {/* ── LISTA DE NOTIFICACIONES ── */}
        {!cargando && notificacionesFiltradas.map((notif, idx) => (
          <div
            key={notif.id}
            className={`notif-card ${notif.leida ? "leida" : "no-leida"} acento-borde-${colorPorTipo(notif.tipo)}`}
            style={{ animationDelay: `${idx * 0.07}s` }}
            onClick={() => abrirNotificacion(notif)}
          >
            <div className={`notif-card-icono acento-${colorPorTipo(notif.tipo)}`}>
              {iconoPorTipo(notif.tipo)}
            </div>

            <div className="notif-card-body">
              <div className="notif-card-header">
                <span className="notif-card-titulo">{notif.titulo}</span>
                {!notif.leida && <span className="notif-punto-nuevo" />}
              </div>
              <span className="notif-card-preview">
                {notif.mensaje.length > 70
                  ? notif.mensaje.slice(0, 70) + "..."
                  : notif.mensaje}
              </span>
              <span className="notif-card-fecha">{formatearFecha(notif.fecha)}</span>
            </div>

            <span className="notif-card-arrow">›</span>
          </div>
        ))}
      </div>

  
    </div>
  );
}

export default Notificaciones;