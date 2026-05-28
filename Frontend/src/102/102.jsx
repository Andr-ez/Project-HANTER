// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";


import "./102.css";

import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";
import userIcon        from "/fotos/icon/user-icon.png";
import weekIcon        from "/fotos/icon/week-icon.png";
import keyIcon         from "/fotos/icon/gancho-icon.png";

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
// COMPONENTE AÑADIR CERTIFICADO
// ==============================
function AnadirCertificado() {
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);
  const [error,       setError]       = useState(null);

  const [usuario, setUsuario] = useState({ nombre: "", foto: "", rol: "" });
  const [botones, setBotones] = useState([]);

  const [formData, setFormData] = useState({
    institucion: "",
    fechaCertificacion: "",
    titulo: "",
  });

  const [archivoPDF,    setArchivoPDF]    = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const inputFileRef = useRef(null);

  // ==============================
  // CARGA INICIAL DE SESIÓN
  // ==============================
  useEffect(() => {
    document.title = "AÑADIR CERTIFICADO";

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/auth/sesion", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) { navigate("/001"); return; }

        const data = await response.json();
        setUsuario({
          nombre: data.usuario.nombre,
          foto:   data.usuario.foto || null,
          rol:    data.usuario.rol,
        });
        setBotones(data.botones);

      } catch (err) {
        console.error("Error al cargar datos:", err);
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
  // MANEJO DEL FORMULARIO
  // ==============================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArchivoSeleccionado = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (archivo.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF.");
      return;
    }
    setArchivoPDF(archivo);
    setNombreArchivo(archivo.name);
  };

  // ==============================
  // ENVÍO DEL FORMULARIO
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.institucion.trim()) {
      alert("El nombre de la institución es obligatorio.");
      return;
    }
    if (!formData.fechaCertificacion.trim()) {
      alert("La fecha de certificación es obligatoria.");
      return;
    }
    if (!formData.titulo.trim()) {
      alert("El título es obligatorio.");
      return;
    }
    if (!archivoPDF) {
      alert("Debes adjuntar el archivo PDF del certificado.");
      return;
    }

    try {
      setEnviando(true);

      const token = localStorage.getItem("token");

      const formPayload = new FormData();
      formPayload.append("titulo",              formData.titulo);
      formPayload.append("institucion",         formData.institucion);
      formPayload.append("fecha_certificacion", formData.fechaCertificacion);
      formPayload.append("archivo",             archivoPDF); // multer espera campo "archivo"

      const response = await fetch("http://localhost:3000/certificados/anadir", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formPayload,
      });

      const data = await response.json();

      if (response.ok) {
        alert("✓ Su certificado fue enviado a revisión. Se le notificará cuando sea aprobado.");
        navigate("/101");
      } else {
        alert(data.error || "Error al enviar el certificado.");
      }

    } catch (err) {
      console.error("Error al enviar certificado:", err);
      alert("No se pudo conectar con el servidor. Inténtalo más tarde.");
    } finally {
      setEnviando(false);
    }
  };

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="anadir-cert-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>AÑADIR<br />CERTFICADO</h1>
      </div>

      <header className="header-content">
        <img src={menuIcon} alt="Menu" className="icon-btn" onClick={() => setMenuAbierto(true)} />
        <img
          src={bellIcon}
          alt="Notificaciones"
          className="icon-btn"
          onClick={() => navigate("/500")}
        />
      </header>

      <nav className="nav-horizontal">
        {cargando ? (
          <span className="loading-text">Cargando...</span>
        ) : (
          botonesHeader.map(btn => (
            <button
              key={btn.id}
              className={btn.link === "/101" ? "active" : ""}
              onClick={() => navigate(btn.link)}
            >
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      <main className="main-content">
        {error && <p className="error-msg">{error}</p>}

        <form className="cert-form" onSubmit={handleSubmit} noValidate>

          <div className="form-field">
            <label className="field-label">NOMBRE DE LA INSTITUCIÓN</label>
            <div className="input-group">
              <img src={userIcon} alt="Institución" />
              <input
                type="text"
                name="institucion"
                placeholder="EJEMPLO: SENA SERVICIO NACIONAL"
                value={formData.institucion}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">FECHA DE LA CERTIFICACIÓN</label>
            <div className="input-group">
              <img src={weekIcon} alt="Fecha" />
              <input
                type="text"
                name="fechaCertificacion"
                placeholder="DD/MM/AA"
                value={formData.fechaCertificacion}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">TÍTULO</label>
            <div className="input-group">
              <img src={userIcon} alt="Título" />
              <input
                type="text"
                name="titulo"
                placeholder="EJEMPLO: ANALISTA DE SOFTWARE"
                value={formData.titulo}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">ADJUNTAR ARCHIVO PDF DEL CERTIFICADO</label>
            <input
              ref={inputFileRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handleArchivoSeleccionado}
            />
            <div className="pdf-adjuntar">
              <img
                src={keyIcon}
                alt="Adjuntar PDF"
                className="gancho-icon"
                onClick={() => inputFileRef.current.click()}
                title="Haz clic para adjuntar tu PDF"
              />
              {nombreArchivo ? (
                <span className="nombre-archivo">{nombreArchivo}</span>
              ) : (
                <span className="nombre-archivo placeholder-archivo">
                  Ningún archivo seleccionado
                </span>
              )}
            </div>
          </div>

          <p className="aviso-revision">
            * Tu certificado quedará <strong>pendiente de aprobación</strong> hasta que un administrador lo revise.
          </p>

          <button type="submit" className="btn-anadir" disabled={enviando}>
            {enviando ? "ENVIANDO..." : "AÑADIR CERTIFICADO A\nTU BASE DE DATOS"}
          </button>

        </form>
      </main>

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
            <SidebarBtn key={btn.id} btn={btn} navigate={navigate} cerrarMenu={() => setMenuAbierto(false)} />
          ))}
        </nav>

      </aside>

      {menuAbierto && <div className="overlay" onClick={() => setMenuAbierto(false)} />}

      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>

    </div>
  );
}

export default AnadirCertificado;