// ==============================
// IMPORTACIONES
// ==============================
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./118-A.css";

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
    if (tieneHijos) setAbierto(prev => !prev);
    else { cerrarMenu(); navigate(btn.link); }
  };

  return (
    <div className="sidebar-item">
      <button
        className={`sidebar-btn ${tieneHijos ? "tiene-hijos" : ""} ${abierto ? "abierto" : ""}`}
        onClick={handleClick}
      >
        <span>{btn.nombre}</span>
        {tieneHijos && <span className={`sidebar-arrow ${abierto ? "rotado" : ""}`}>›</span>}
      </button>

      {tieneHijos && (
        <div className={`sidebar-hijos ${abierto ? "visible" : ""}`}>
          {btn.hijos.map(hijo => (
            <button key={hijo.id} className="sidebar-hijo-btn"
              onClick={() => { cerrarMenu(); navigate(hijo.link); }}>
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
// COMPONENTE ADMIN — ENVIAR NÓMINA
// ==============================
function EnviarNominaAdmin() {
  const navigate = useNavigate();

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);
  const [error,       setError]       = useState(null);

  const [usuario,   setUsuario]   = useState({ nombre: "", foto: "", rol: "" });
  const [botones,   setBotones]   = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [formData, setFormData] = useState({
    id_empleado:  "",
    fechaNomina:  "",   // formato "AAAA-MM" del <input type="month">
    salarioBase:  "",
    deducciones:  "",
    totalBonos:   "",
    totalPago:    "",
  });

  const [archivoPDF,    setArchivoPDF]    = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const inputFileRef = useRef(null);

  // ==============================
  // CARGA INICIAL DE SESIÓN + EMPLEADOS
  // ==============================
  useEffect(() => {
    document.title = "ENVIAR NÓMINA";
    const token = localStorage.getItem("token");

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const resSesion = await fetch("http://localhost:3000/auth/sesion", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!resSesion.ok) { navigate("/001"); return; }

        const dataSesion = await resSesion.json();

        // Solo administradores/supervisores pueden entrar
        if (dataSesion.usuario.rol !== "Administrador" && dataSesion.usuario.rol !== "Supervisor") {
          navigate("/104");
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

    // Lista de empleados desde la base de datos
    const cargarEmpleados = async () => {
      try {
        const res = await fetch("http://localhost:3000/empleados", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error del servidor");
        const data = await res.json();
        setEmpleados(data);
      } catch (err) {
        console.error("Error al cargar empleados:", err);
        setEmpleados([]);
      }
    };

    cargarDatos();
    cargarEmpleados();
  }, [navigate]);

  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  // ==============================
  // MANEJO DEL FORMULARIO
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const actualizado = { ...prev, [name]: value };

      // Auto-calcular el total: salario + bonos - deducciones.
      // El admin puede sobrescribirlo manualmente después.
      if (["salarioBase", "deducciones", "totalBonos"].includes(name)) {
        const s = Number(actualizado.salarioBase) || 0;
        const d = Number(actualizado.deducciones) || 0;
        const b = Number(actualizado.totalBonos)  || 0;
        actualizado.totalPago = String(s + b - d);
      }

      return actualizado;
    });
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

    if (!formData.id_empleado) {
      alert("Debes seleccionar un empleado.");
      return;
    }
    if (!formData.fechaNomina) {
      alert("Debes indicar la fecha (mes) de la nómina.");
      return;
    }
    if (!archivoPDF) {
      alert("Debes adjuntar el archivo PDF de la nómina.");
      return;
    }

    // "AAAA-MM" -> mes y año
    const [anio, mes] = formData.fechaNomina.split("-");

    try {
      setEnviando(true);
      const token = localStorage.getItem("token");

      const formPayload = new FormData();
      formPayload.append("id_empleado",  formData.id_empleado);
      formPayload.append("mes",          String(Number(mes)));
      formPayload.append("anio",         anio);
      formPayload.append("salario_base", formData.salarioBase || "0");
      formPayload.append("deducciones",  formData.deducciones || "0");
      formPayload.append("total_bonos",  formData.totalBonos  || "0");
      formPayload.append("total_pago",   formData.totalPago   || "0");
      formPayload.append("archivo",      archivoPDF); // multer espera campo "archivo"

      const response = await fetch("http://localhost:3000/nomina/enviar", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formPayload,
      });

      const data = await response.json();

      if (response.ok) {
        alert("✓ La nómina fue enviada y el empleado fue notificado.");
        // Limpiar el formulario
        setFormData({
          id_empleado: "", fechaNomina: "", salarioBase: "",
          deducciones: "", totalBonos: "", totalPago: "",
        });
        setArchivoPDF(null);
        setNombreArchivo("");
      } else {
        alert(data.error || "Error al enviar la nómina.");
      }
    } catch (err) {
      console.error("Error al enviar nómina:", err);
      alert("No se pudo conectar con el servidor. Inténtalo más tarde.");
    } finally {
      setEnviando(false);
    }
  };

  // ==============================
  // RENDER JSX
  // ==============================
  return (
    <div className="enviar-nomina-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>ENVIAR NÓMINA</h1>
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
              className={btn.link === "/104" ? "active" : ""}
              onClick={() => navigate(btn.link)}
            >
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      <main className="main-content">
        {error && <p className="error-msg">{error}</p>}

        <form className="nomina-form" onSubmit={handleSubmit} noValidate>

          {/* EMPLEADO */}
          <div className="form-field">
            <label className="field-label">EMPLEADO</label>
            <div className="input-group">
              <img src={userIcon} alt="Empleado" />
              <select
                name="id_empleado"
                value={formData.id_empleado}
                onChange={handleChange}
                required
              >
                <option value="">SELECCIONA UN EMPLEADO</option>
                {empleados.map(emp => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre} {emp.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FECHA DE NÓMINA */}
          <div className="form-field">
            <label className="field-label">FECHA DE NÓMINA (MES)</label>
            <div className="input-group">
              <img src={weekIcon} alt="Fecha" />
              <input
                type="month"
                name="fechaNomina"
                value={formData.fechaNomina}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* SALARIO BASE */}
          <div className="form-field">
            <label className="field-label">SALARIO BASE</label>
            <div className="input-group">
              <img src={userIcon} alt="Salario" />
              <input
                type="number"
                name="salarioBase"
                placeholder="EJEMPLO: 2300000"
                value={formData.salarioBase}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* DEDUCCIONES */}
          <div className="form-field">
            <label className="field-label">DEDUCCIONES</label>
            <div className="input-group">
              <img src={userIcon} alt="Deducciones" />
              <input
                type="number"
                name="deducciones"
                placeholder="EJEMPLO: 150000"
                value={formData.deducciones}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* TOTAL EN BONOS */}
          <div className="form-field">
            <label className="field-label">TOTAL EN BONOS</label>
            <div className="input-group">
              <img src={userIcon} alt="Bonos" />
              <input
                type="number"
                name="totalBonos"
                placeholder="EJEMPLO: 100000"
                value={formData.totalBonos}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* TOTAL DEL PAGO */}
          <div className="form-field">
            <label className="field-label">VALOR TOTAL DEL PAGO</label>
            <div className="input-group">
              <img src={userIcon} alt="Total" />
              <input
                type="number"
                name="totalPago"
                placeholder="SE CALCULA AUTOMÁTICO"
                value={formData.totalPago}
                onChange={handleChange}
                min="0"
              />
            </div>
            <span className="ayuda-total">
              * Se calcula solo (salario + bonos − deducciones), pero puedes editarlo.
            </span>
          </div>

          {/* ADJUNTAR PDF */}
          <div className="form-field">
            <label className="field-label">ADJUNTAR PDF DE LA NÓMINA</label>
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
                title="Haz clic para adjuntar el PDF"
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

          <button type="submit" className="btn-enviar-nomina" disabled={enviando}>
            {enviando ? "ENVIANDO..." : "ENVIAR NÓMINA AL EMPLEADO"}
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

export default EnviarNominaAdmin;
