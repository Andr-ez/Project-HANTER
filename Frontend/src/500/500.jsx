import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import "./500.css";

import bellIcon from "/fotos/icon/campana.png";

function formatearFecha(isoString) {
  return new Date(isoString).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

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

function colorPorTipo(tipo) {
  if (tipo === "certificado_aprobado" || tipo === "inscripcion_aprobada") return "verde";
  if (tipo === "certificado_rechazado") return "rojo";
  return "azul";
}

function Notificaciones() {
  const navigate = useNavigate();
  const { usuario, cargando } = useSesion();

  const [cargandoNotif,     setCargandoNotif]     = useState(true);
  const [errorConexion,     setErrorConexion]     = useState(false);
  const [notificaciones,    setNotificaciones]    = useState([]);
  const [notificacionActiva, setNotificacionActiva] = useState(null);
  const [filtroAbierto,     setFiltroAbierto]     = useState(false);
  const [filtroActivo,      setFiltroActivo]      = useState(null);
  const filtroRef = useRef(null);

  useEffect(() => {
    document.title = "Notificaciones";
    const token = localStorage.getItem("token");

    const cargarNotificaciones = async () => {
      try {
        setCargandoNotif(true);
        const res = await fetch("http://localhost:3000/notificaciones", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotificaciones(data.map(n => ({
            id:             n.id_notificacion,
            tipo:           n.tipo           || "general",
            titulo:         n.titulo         || "Notificación",
            mensaje:        n.mensaje,
            fecha:          n.fecha_creacion,
            leida:          n.leida,
            ruta_destino:   n.ruta_destino   || null,
            etiqueta_boton: n.etiqueta_boton || "Ver más",
          })));
        }
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
        setErrorConexion(true);
      } finally {
        setCargandoNotif(false);
      }
    };

    cargarNotificaciones();
  }, []);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) setFiltroAbierto(false);
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const abrirNotificacion = async (notif) => {
    setNotificaciones(prev => prev.map(n => n.id === notif.id ? { ...n, leida: true } : n));
    setNotificacionActiva(notif);
    if (!notif.leida) {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:3000/notificaciones/${notif.id}/leer`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      }).catch(err => console.error("Error al marcar notificación:", err));
    }
  };

  const notificacionesFiltradas = [...notificaciones].sort((a, b) => {
    if (filtroActivo === "fecha")  return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "titulo") return a.titulo.localeCompare(b.titulo);
    if (a.leida !== b.leida) return a.leida ? 1 : -1;
    return new Date(b.fecha) - new Date(a.fecha);
  });

  const cantidadNoLeidas = notificaciones.filter(n => !n.leida).length;

  // Vista detalle
  if (notificacionActiva) {
    return (
      <div className="notif-page page">
        <div className="circuloFondo circulo1" />
        <div className="circuloFondo circulo2" />
        <button className="back-btn-500" onClick={() => setNotificacionActiva(null)}>←</button>
        <div className="notif-detalle-wrapper">
          <div className={`notif-detalle-icono acento-${colorPorTipo(notificacionActiva.tipo)}`}>
            <span>{iconoPorTipo(notificacionActiva.tipo)}</span>
          </div>
          <h2 className="notif-detalle-titulo">{notificacionActiva.titulo}</h2>
          <span className="notif-detalle-fecha">🕐 {formatearFecha(notificacionActiva.fecha)}</span>
          <div className="notif-detalle-cuerpo"><p>{notificacionActiva.mensaje}</p></div>
          <button className={`notif-btn-accion acento-${colorPorTipo(notificacionActiva.tipo)}`}
            onClick={() => navigate(notificacionActiva.ruta_destino)}>
            {notificacionActiva.etiqueta_boton} →
          </button>
        </div>
      </div>
    );
  }

  // Vista listado
  return (
    <div className="notif-page page">
      <div className="circuloFondo circulo1" />
      <div className="circuloFondo circulo2" />

      <div className="top-bar">
        <button className="back-btn-500" onClick={() => navigate(-1)}>←</button>
        <div className="top-bar-right">
          <div className="bell-wrapper">
            <img src={bellIcon} alt="notificaciones" className="top-icon" />
            {cantidadNoLeidas > 0 && (
              <span className="bell-badge">{cantidadNoLeidas}</span>
            )}
          </div>
        </div>
      </div>

      <div className="title"><h1>NOTIFICACIONES</h1></div>

      <div className="notif-main-content">
        {!cargandoNotif && (
          <p className="notif-saludo">
            Hola <strong>{usuario.nombre}</strong>, estas son tus notificaciones
          </p>
        )}

        <div className="notif-barra-acciones">
          {cantidadNoLeidas > 0 && (
            <span className="notif-badge-noLeidas">{cantidadNoLeidas} sin leer</span>
          )}

          <div className="notif-filtro-wrapper" ref={filtroRef}>
            <button className={`notif-filtro-btn ${filtroActivo ? "activo" : ""}`}
              onClick={() => setFiltroAbierto(prev => !prev)}>
              FILTRAR POR <span className="filtro-icono">▼</span>
            </button>
            {filtroAbierto && (
              <div className="notif-filtro-dropdown">
                <button className={filtroActivo === "fecha" ? "seleccionado" : ""}
                  onClick={() => { setFiltroActivo("fecha"); setFiltroAbierto(false); }}>
                  📅 Fecha de notificación
                </button>
                <button className={filtroActivo === "titulo" ? "seleccionado" : ""}
                  onClick={() => { setFiltroActivo("titulo"); setFiltroAbierto(false); }}>
                  🔤 Título (A-Z)
                </button>
                {filtroActivo && (
                  <button className="limpiar-filtro"
                    onClick={() => { setFiltroActivo(null); setFiltroAbierto(false); }}>
                    ✕ Quitar filtro
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {!cargandoNotif && errorConexion && (
          <div className="notif-estado vacio">
            <span className="notif-vacio-icono">⚠️</span>
            <p className="notif-vacio-titulo">No se pudieron cargar las notificaciones</p>
            <p className="notif-vacio-sub">Revisa tu conexión o intenta más tarde.</p>
            <button className="notif-btn-reintentar"
              onClick={() => { setErrorConexion(false); setCargandoNotif(true); window.location.reload(); }}>
              Reintentar
            </button>
          </div>
        )}

        {cargandoNotif && (
          <div className="notif-estado">
            <div className="notif-spinner" />
            <p>Cargando notificaciones...</p>
          </div>
        )}

        {!cargandoNotif && !errorConexion && notificaciones.length === 0 && (
          <div className="notif-estado vacio">
            <span className="notif-vacio-icono">🔕</span>
            <p className="notif-vacio-titulo">Sin notificaciones</p>
            <p className="notif-vacio-sub">No tienes notificaciones por el momento.</p>
          </div>
        )}

        {!cargandoNotif && !errorConexion && notificacionesFiltradas.map((notif, idx) => (
          <div key={notif.id}
            className={`notif-card ${notif.leida ? "leida" : "no-leida"} acento-borde-${colorPorTipo(notif.tipo)}`}
            style={{ animationDelay: `${idx * 0.07}s` }}
            onClick={() => abrirNotificacion(notif)}>
            <div className={`notif-card-icono acento-${colorPorTipo(notif.tipo)}`}>
              {iconoPorTipo(notif.tipo)}
            </div>
            <div className="notif-card-body">
              <div className="notif-card-header">
                <span className="notif-card-titulo">{notif.titulo}</span>
                {!notif.leida && <span className="notif-punto-nuevo" />}
              </div>
              <span className="notif-card-preview">
                {notif.mensaje.length > 70 ? notif.mensaje.slice(0, 70) + "..." : notif.mensaje}
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