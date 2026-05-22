// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./perfil.css";

// Íconos
import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";
import ToggleDarkMode  from "../components/ToggleDarkMode";

// ==============================
// COMPONENTE SIDEBAR BTN
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
// UTILIDADES
// ==============================
function formatFecha(isoStr) {
  if (!isoStr) return "—";
  const d = new Date(isoStr);
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ==============================
// COMPONENTE PRINCIPAL
// ==============================
function Perfil() {
  const navigate = useNavigate();
  const fileRef  = useRef(null);

  // Sesión / sidebar
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [botones,     setBotones]     = useState([]);
  const [sesion,      setSesion]      = useState({ nombre: "", foto: null, rol: "" });

  // Datos del perfil
  const [perfil,      setPerfil]      = useState(null);
  const [cargando,    setCargando]    = useState(true);
  const [errorPerfil, setErrorPerfil] = useState(null);

  // Foto upload
  const [uploadStatus, setUploadStatus] = useState({ msg: "", tipo: "" });
  const [subiendo,     setSubiendo]     = useState(false);

  // Cambiar nombre usuario
  const [nuevoNombre,     setNuevoNombre]     = useState("");
  const [nombreMsg,       setNombreMsg]       = useState({ msg: "", tipo: "" });
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  // ==============================
  // CARGA INICIAL
  // ==============================
  useEffect(() => {
    document.title = "MI PERFIL";

    const token = localStorage.getItem("token");
    if (!token) { navigate("/001"); return; }

    const cargar = async () => {
      try {
        setCargando(true);

        // Sesión y botones
        const resSesion = await fetch("http://localhost:3000/auth/sesion", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resSesion.ok) { navigate("/001"); return; }
        const dataSesion = await resSesion.json();
        setSesion({
          nombre: dataSesion.usuario.nombre,
          foto:   dataSesion.usuario.foto,
          rol:    dataSesion.usuario.rol
        });
        setBotones(dataSesion.botones);

        // Perfil completo
        const resPerfil = await fetch("http://localhost:3000/usuarios/perfil", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!resPerfil.ok) throw new Error("Error al obtener perfil");
        const dataPerfil = await resPerfil.json();
        setPerfil(dataPerfil);
        setNuevoNombre(dataPerfil.nombre_usuario);

      } catch (err) {
        console.error(err);
        setErrorPerfil("No se pudo cargar el perfil. Intenta de nuevo.");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [navigate]);

  // ==============================
  // SUBIR FOTO DE PERFIL
  // ==============================
  const handleFotoChange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendo(true);
    setUploadStatus({ msg: "Subiendo foto...", tipo: "" });

    const formData = new FormData();
    formData.append("foto", archivo);

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:3000/usuarios/perfil/foto", {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al subir foto");

      // Actualizar foto en perfil y sidebar
      setPerfil(prev => ({
        ...prev,
        empleado: { ...prev.empleado, foto_perfil: data.foto_url }
      }));
      setSesion(prev => ({ ...prev, foto: data.foto_url }));
      setUploadStatus({ msg: "✓ Foto actualizada", tipo: "" });

      // Limpiar mensaje después de 3s
      setTimeout(() => setUploadStatus({ msg: "", tipo: "" }), 3000);
    } catch (err) {
      setUploadStatus({ msg: err.message, tipo: "error" });
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  // ==============================
  // CAMBIAR NOMBRE DE USUARIO
  // ==============================
  const handleCambiarNombre = async () => {
    if (!nuevoNombre.trim() || nuevoNombre.trim() === perfil.nombre_usuario) {
      setNombreMsg({ msg: "Escribe un nombre diferente al actual", tipo: "error" });
      return;
    }

    setGuardandoNombre(true);
    setNombreMsg({ msg: "", tipo: "" });

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:3000/usuarios/perfil/nombre", {
        method:  "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`
        },
        body: JSON.stringify({ nombre_usuario: nuevoNombre.trim() })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al cambiar nombre");

      setPerfil(prev => ({ ...prev, nombre_usuario: data.nombre_usuario }));
      setNombreMsg({ msg: "✓ Nombre actualizado correctamente", tipo: "" });
      setTimeout(() => setNombreMsg({ msg: "", tipo: "" }), 3000);
    } catch (err) {
      setNombreMsg({ msg: err.message, tipo: "error" });
    } finally {
      setGuardandoNombre(false);
    }
  };

  // Filtros sidebar
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));
  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="perfil-page">

      {/* Círculo de fondo */}
      <div className="circuloFondo"></div>

      {/* Título */}
      <div className="title">
        <h1>MI PERFIL</h1>
      </div>

      {/* HEADER */}
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
          onClick={() => navigate("/500")}
          style={{ cursor: "pointer" }}
        />
      </header>

      {/* NAV HORIZONTAL */}
      <nav className="nav-horizontal">
        {botonesHeader.map(btn => (
          <button key={btn.id} onClick={() => navigate(btn.link)}>
            {btn.nombre}
          </button>
        ))}
      </nav>

      {/* CONTENIDO */}
      <div className="perfil-scroll">

        {cargando && (
          <div className="perfil-loading">CARGANDO PERFIL...</div>
        )}

        {errorPerfil && !cargando && (
          <p className="perfil-error-msg">{errorPerfil}</p>
        )}

        {perfil && !cargando && (
          <>
            {/* ─── HÉROE: foto + nombre + rol + ID ─── */}
            <div className="perfil-card-hero">

              {/* Foto grande con hover para cambiar */}
              <div
                className="perfil-avatar-wrap"
                onClick={() => fileRef.current?.click()}
                title="Haz clic para cambiar tu foto de perfil"
              >
                <img
                  src={perfil.empleado.foto_perfil || userPlaceholder}
                  alt="Foto de perfil"
                />
                <div className="perfil-avatar-overlay">
                  <span>{subiendo ? "SUBIENDO..." : "CAMBIAR FOTO"}</span>
                </div>
              </div>

              {/* Input oculto */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="perfil-file-input"
                onChange={handleFotoChange}
              />

              {/* Nombre completo */}
              <p className="perfil-hero-nombre">
                {perfil.empleado.nombre} {perfil.empleado.apellido}
              </p>

              {/* Rol */}
              <p className="perfil-hero-rol">{perfil.empleado.rol}</p>

              {/* ID de usuario */}
              <span className="perfil-hero-id">ID #{perfil.id_usuario}</span>

              {/* Estado de subida */}
              <p className={`perfil-upload-status ${uploadStatus.tipo}`}>
                {uploadStatus.msg}
              </p>
            </div>

            {/* ─── GRID DE DATOS ─── */}
            <div className="perfil-grid">

              <div className="perfil-campo">
                <div className="perfil-campo-label">
                  <span className="perfil-campo-label-icon">✉</span>
                  CORREO
                </div>
                <div className="perfil-campo-valor">{perfil.empleado.correo}</div>
              </div>

              <div className="perfil-campo">
                <div className="perfil-campo-label">
                  <span className="perfil-campo-label-icon">📱</span>
                  TELÉFONO
                </div>
                <div className="perfil-campo-valor">{perfil.empleado.celular}</div>
              </div>

              <div className="perfil-campo">
                <div className="perfil-campo-label">
                  <span className="perfil-campo-label-icon">🪪</span>
                  N° IDENTIFICACIÓN
                </div>
                <div className="perfil-campo-valor">{perfil.empleado.documento}</div>
              </div>

              <div className="perfil-campo">
                <div className="perfil-campo-label">
                  <span className="perfil-campo-label-icon">👤</span>
                  NOMBRE DE USUARIO
                </div>
                <div className="perfil-campo-valor">{perfil.nombre_usuario}</div>
              </div>

              <div className="perfil-campo">
                <div className="perfil-campo-label">
                  <span className="perfil-campo-label-icon">📅</span>
                  FECHA DE REGISTRO
                </div>
                <div className="perfil-campo-valor">{formatFecha(perfil.empleado.fecha_ingreso)}</div>
              </div>

              <div className="perfil-campo">
                <div className="perfil-campo-label">
                  <span className="perfil-campo-label-icon">🕐</span>
                  ÚLTIMO ACCESO
                </div>
                <div className="perfil-campo-valor">{formatFecha(perfil.ultimo_login)}</div>
              </div>

            </div>

            {/* ─── CAMBIAR NOMBRE DE USUARIO ─── */}
            <div className="perfil-cambiar-nombre">
              <p className="perfil-cambiar-titulo">CAMBIAR NOMBRE DE USUARIO</p>
              <div className="perfil-nombre-form">
                <input
                  className="perfil-nombre-input"
                  type="text"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Nuevo nombre de usuario"
                  onKeyDown={e => e.key === "Enter" && handleCambiarNombre()}
                />
                <button
                  className="perfil-nombre-btn"
                  onClick={handleCambiarNombre}
                  disabled={guardandoNombre}
                >
                  {guardandoNombre ? "GUARDANDO..." : "GUARDAR"}
                </button>
              </div>
              <p className={`perfil-nombre-msg ${nombreMsg.tipo}`}>
                {nombreMsg.msg}
              </p>
            </div>
          </>
        )}
      </div>

      {/* SIDEBAR */}
      <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
        <button className="close-btn-sidebar" onClick={() => setMenuAbierto(false)}>
          ←
        </button>

        <div className="user-info-sidebar">
          <div>
            <span style={{ display: "block", fontSize: "14px" }}>{sesion.nombre}</span>
            <span style={{ display: "block", fontSize: "11px", opacity: 0.7 }}>{sesion.rol}</span>
          </div>
          {/* Avatar clickeable → perfil */}
          <div
            className="user-avatar-circle"
            onClick={() => { setMenuAbierto(false); navigate("/perfil"); }}
            style={{ cursor: "pointer" }}
            title="Ver mi perfil"
          >
            <img src={sesion.foto || userPlaceholder} alt="User" />
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

export default Perfil;
