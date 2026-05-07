// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./103.css";

// Íconos
import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";

// PDFs de ejemplo — solo para fallback de desarrollo
import certificadoCiberseguridad from "/fotos/pdf/certificados/certificadoCiberseguridad.pdf";
import certificadoIngles1        from "/fotos/pdf/certificados/certificadoIngles1.pdf";
import certificadoMarketing      from "/fotos/pdf/certificados/certificadoMarketing.pdf";
import certificadoIngles3        from "/fotos/pdf/certificados/certificadoIngles3.pdf";
import certificadoPowerPoint     from "/fotos/pdf/certificados/certificadoPowerPoint.pdf";

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
// COMPONENTE ADMIN — REVISAR CERTIFICADOS
// Muestra todos los certificados PENDIENTES de todos los empleados.
// El administrador puede aprobarlos o rechazarlos uno a uno.
// ==============================
function AdminCertificados() {
  const navigate = useNavigate();

  const [menuAbierto,   setMenuAbierto]   = useState(false);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState(null);
  const [cargandoCerts, setCargandoCerts] = useState(true);

  const [usuario,       setUsuario]       = useState({ nombre: "", foto: "", rol: "" });
  const [botones,       setBotones]       = useState([]);

  // Lista de certificados pendientes de todos los empleados
  const [certificados,  setCertificados]  = useState([]);

  // Cert expandido para ver detalles/PDF
  const [expandido,     setExpandido]     = useState(null);

  // Filtro
  const [filtroAbierto, setFiltroAbierto] = useState(false);
  const [filtroActivo,  setFiltroActivo]  = useState(null);
  const filtroRef = useRef(null);

  // ==============================
  // USE EFFECT INICIAL
  // ==============================
  useEffect(() => {
    document.title = "ADMIN — CERTIFICADOS";

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const resSesion = await fetch("http://localhost:3000/auth/sesion", { credentials: "include" });

        if (!resSesion.ok) { navigate("/001"); return; }

        const dataSesion = await resSesion.json();

        // Redirigir si el usuario NO es administrador
        // TODO BACKEND: el campo rol debe venir en la respuesta de /auth/sesion
        if (dataSesion.usuario.rol !== "ADMINISTRADOR") {
          navigate("/103");
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
        setError("No se pudo conectar con el servidor.");
        setUsuario({ nombre: "Admin HANTER", foto: null, rol: "ADMINISTRADOR" });
        setBotones([
          { id: 1, nombre: "INICIO",         link: "/100",    posicion: ["header", "sidebar"], hijos: [] },
          { id: 2, nombre: "CERTIFICADOS",   link: "/101",    posicion: ["header", "sidebar"], hijos: [] },
          { id: 3, nombre: "NOMINA",         link: "/104", posicion: ["header", "sidebar"], hijos: [] },
          { id: 4, nombre: "CAPACITACIONES", link: "/125",   posicion: ["header", "sidebar"], hijos: [] },
          {
            id: 5, nombre: "BENEFICIOS", link: null, posicion: ["sidebar"],
            hijos: [
              { id: 51, nombre: "VISUALIZAR", link: "/crono/general"   },
              { id: 52, nombre: "SOLICITAR",  link: "/crono/induccion" },
            ]
          },
          { id: 7, nombre: "CONFIGURACIÓN", link: "/config", posicion: ["sidebar"], hijos: [] },
        ]);
      } finally {
        setCargando(false);
      }
    };

    const cargarCertificadosPendientes = async () => {
      try {
        setCargandoCerts(true);

        // =====================================================================
        // TODO BACKEND — GET /certificados/pendientes
        //
        // Solo accesible por usuarios con rol = "ADMINISTRADOR".
        // Retorna TODOS los certificados de TODOS los empleados
        // con estado = "PENDIENTE".
        //
        // Respuesta esperada (array):
        // [
        //   {
        //     id:              number,  — ID único del certificado en la BD
        //     id_usuario:      number,  — ID del empleado que lo subió
        //     nombre_empleado: string,  — Nombre completo del empleado
        //     institucion:     string,  — Institución emisora
        //     titulo:          string,  — Título del certificado
        //     fecha:           string,  — Fecha de certificación (DD/MM/AA)
        //     ruta_pdf:        string,  — URL/ruta del PDF en el servidor
        //     estado:          string   — Siempre "PENDIENTE" en este endpoint
        //   },
        //   ...
        // ]
        // =====================================================================
        const resCerts = await fetch("http://localhost:3000/certificados/pendientes", {
          credentials: "include",
        });

        if (resCerts.ok) {
          const data = await resCerts.json();
          setCertificados(data);
        } else {
          throw new Error("Respuesta no OK del servidor.");
        }

      } catch (err) {
        console.error("Error al cargar certificados pendientes:", err);
        // Fallback de desarrollo con PDFs locales
        setCertificados([
          { id: 1, id_usuario: 10, nombre_empleado: "Laura Gómez",    institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "CIBERSEGURIDAD",                fecha: "28/11/2024", ruta_pdf: certificadoCiberseguridad, estado: "PENDIENTE" },
          { id: 2, id_usuario: 10, nombre_empleado: "Laura Gómez",    institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "ENGLISH DOES WORK - LEVEL 1",  fecha: "24/06/2024", ruta_pdf: certificadoIngles1,        estado: "PENDIENTE" },
          { id: 3, id_usuario: 11, nombre_empleado: "Carlos Herrera", institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "MARKETING DIGITAL",            fecha: "24/10/2024", ruta_pdf: certificadoMarketing,      estado: "PENDIENTE" },
          { id: 4, id_usuario: 12, nombre_empleado: "Sofía Ramírez",  institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "ENGLISH DOES WORK - LEVEL 3",  fecha: "11/01/2025", ruta_pdf: certificadoIngles3,        estado: "PENDIENTE" },
          { id: 5, id_usuario: 12, nombre_empleado: "Sofía Ramírez",  institucion: "SENA SERVICIO NACIONAL de APRENDIZAJE", titulo: "USO DE MICROSOFT POWER POINT", fecha: "07/09/2024", ruta_pdf: certificadoPowerPoint,     estado: "PENDIENTE" },
        ]);
      } finally {
        setCargandoCerts(false);
      }
    };

    cargarDatos();
    cargarCertificadosPendientes();
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

  // Ordenar según filtro
  const certificadosFiltrados = [...certificados].sort((a, b) => {
    if (filtroActivo === "fecha")    return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "titulo")   return a.titulo.localeCompare(b.titulo);
    if (filtroActivo === "empleado") return a.nombre_empleado.localeCompare(b.nombre_empleado);
    return 0;
  });

  // ==============================
  // APROBAR CERTIFICADO
  // ==============================
  const handleAprobar = async (id) => {
    try {
      // =====================================================================
      // TODO BACKEND — PATCH /certificados/:id/aprobar
      //
      // Solo accesible por ADMINISTRADOR.
      // Cambia el estado del certificado con el id dado a "APROBADO".
      // A partir de ese momento el empleado lo verá en su vista 103.
      //
      // Respuesta esperada: { mensaje: "Certificado aprobado" }
      // =====================================================================
      const res = await fetch(`http://localhost:3000/certificados/${id}/aprobar`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        // Remover de la lista local (ya no está pendiente)
        setCertificados(prev => prev.filter(c => c.id !== id));
        if (expandido === id) setExpandido(null);
      } else {
        const data = await res.json();
        alert(data.mensaje || "Error al aprobar el certificado.");
      }
    } catch (err) {
      console.error("Error al aprobar:", err);
      // En desarrollo (sin backend) simulamos la acción localmente
      setCertificados(prev => prev.filter(c => c.id !== id));
      if (expandido === id) setExpandido(null);
    }
  };

  // ==============================
  // RECHAZAR CERTIFICADO
  // ==============================
  const handleRechazar = async (id) => {
    const confirmar = window.confirm("¿Estás seguro de que quieres rechazar este certificado?");
    if (!confirmar) return;

    try {
      // =====================================================================
      // TODO BACKEND — PATCH /certificados/:id/rechazar
      //
      // Solo accesible por ADMINISTRADOR.
      // Cambia el estado del certificado con el id dado a "RECHAZADO".
      // El empleado NO lo verá en su vista 103.
      //
      // Respuesta esperada: { mensaje: "Certificado rechazado" }
      // =====================================================================
      const res = await fetch(`http://localhost:3000/certificados/${id}/rechazar`, {
        method: "PATCH",
        credentials: "include",
      });

      if (res.ok) {
        setCertificados(prev => prev.filter(c => c.id !== id));
        if (expandido === id) setExpandido(null);
      } else {
        const data = await res.json();
        alert(data.mensaje || "Error al rechazar el certificado.");
      }
    } catch (err) {
      console.error("Error al rechazar:", err);
      // En desarrollo simulamos la acción localmente
      setCertificados(prev => prev.filter(c => c.id !== id));
      if (expandido === id) setExpandido(null);
    }
  };

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="buscar-cert-page admin-cert-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>REVISAR<br />CERTIFICADOS</h1>
      </div>

      <button className="back-btn-103" onClick={() => navigate("/101")}>←</button>

      <header className="header-content">
        <img src={menuIcon} alt="Menu" className="icon-btn" onClick={() => setMenuAbierto(true)} />
        <img src={bellIcon} alt="Notificaciones" className="icon-btn" />
      </header>

      <nav className="nav-horizontal">
        {cargando ? (
          <span className="loading-text">Cargando...</span>
        ) : (
          botonesHeader.map(btn => (
            <button key={btn.id} className={btn.link === "/101" ? "active" : ""} onClick={() => navigate(btn.link)}>
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      <main className="main-content">
        {error && <p className="error-msg">{error}</p>}

        {/* Badge contador pendientes */}
        {!cargandoCerts && certificados.length > 0 && (
          <div className="admin-badge-pendientes">
            {certificados.length} pendiente{certificados.length !== 1 ? "s" : ""} de revisión
          </div>
        )}

        {/* FILTRO */}
        <div className="filtro-wrapper" ref={filtroRef}>
          <button
            className={`filtro-btn ${filtroActivo ? "activo" : ""}`}
            onClick={() => setFiltroAbierto(prev => !prev)}
          >
            FILTRAR POR
            <span className="filtro-icono">▼</span>
          </button>

          {filtroAbierto && (
            <div className="filtro-dropdown">
              <button
                className={`filtro-opcion ${filtroActivo === "fecha" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "fecha" ? null : "fecha"); setFiltroAbierto(false); }}
              >
                FECHA DE CERTIFICACIÓN
              </button>
              <button
                className={`filtro-opcion ${filtroActivo === "titulo" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "titulo" ? null : "titulo"); setFiltroAbierto(false); }}
              >
                TIPO DE CERTIFICACIÓN (A-Z)
              </button>
              <button
                className={`filtro-opcion ${filtroActivo === "empleado" ? "seleccionada" : ""}`}
                onClick={() => { setFiltroActivo(filtroActivo === "empleado" ? null : "empleado"); setFiltroAbierto(false); }}
              >
                EMPLEADO (A-Z)
              </button>
            </div>
          )}
        </div>

        {/* LISTA DE CERTIFICADOS PENDIENTES */}
        <div className="cert-lista">
          {cargandoCerts ? (
            <span className="loading-text">Cargando certificados...</span>
          ) : certificadosFiltrados.length === 0 ? (
            <p className="sin-certs">No hay certificados pendientes de revisión. 🎉</p>
          ) : (
            certificadosFiltrados.map(cert => (
              <div key={cert.id} className="admin-cert-card">

                {/* Fila principal — click para expandir */}
                <div
                  className={`admin-cert-fila ${expandido === cert.id ? "expandida" : ""}`}
                  onClick={() => setExpandido(expandido === cert.id ? null : cert.id)}
                >
                  <div className="admin-cert-info">
                    <span className="admin-cert-empleado">{cert.nombre_empleado}</span>
                    <span className="admin-cert-titulo">
                      CERTIFICACIÓN DE {cert.titulo}
                    </span>
                  </div>
                  <span className="admin-expand-arrow">{expandido === cert.id ? "▲" : "▼"}</span>
                </div>

                {/* Panel expandido */}
                {expandido === cert.id && (
                  <div className="admin-cert-detalle">

                    {/* Info detallada */}
                    <div className="admin-detalle-info">
                      <p><strong>Empleado:</strong> {cert.nombre_empleado}</p>
                      <p><strong>Institución:</strong> {cert.institucion}</p>
                      <p><strong>Título:</strong> {cert.titulo}</p>
                      <p><strong>Fecha:</strong> {cert.fecha}</p>
                    </div>

                    {/* Visor PDF inline */}
                    <div className="admin-pdf-viewer">
                      <iframe
                        src={cert.ruta_pdf}
                        title={`PDF - ${cert.titulo}`}
                        className="admin-pdf-iframe"
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="admin-acciones">
                      <button
                        className="btn-aprobar"
                        onClick={(e) => { e.stopPropagation(); handleAprobar(cert.id); }}
                      >
                        ✓ APROBAR
                      </button>
                      <button
                        className="btn-rechazar"
                        onClick={(e) => { e.stopPropagation(); handleRechazar(cert.id); }}
                      >
                        ✕ RECHAZAR
                      </button>
                    </div>

                  </div>
                )}

              </div>
            ))
          )}
        </div>
      </main>

      <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
        <button className="close-btn-sidebar" onClick={() => setMenuAbierto(false)}>←</button>
        <div className="user-info-sidebar">
          <div>
            <span style={{ display: "block", fontSize: "14px" }}>{cargando ? "Cargando..." : usuario.nombre}</span>
            <span style={{ display: "block", fontSize: "11px", opacity: 0.7 }}>{usuario.rol}</span>
          </div>
          <div className="user-avatar-circle">
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

export default AdminCertificados;