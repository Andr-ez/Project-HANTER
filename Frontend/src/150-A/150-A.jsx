// ==============================
// 150-A — GESTIÓN DE USUARIOS  (uso exclusivo de administradores)
// Permite al admin: crear, editar (todos los datos), cambiar la
// foto de perfil y eliminar usuarios normales.
// Consume las rutas /admin/usuarios del backend.
// ==============================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./150-A.css";

// Íconos
import menuIcon        from "/fotos/icon/menu-hamburguesa.png";
import bellIcon        from "/fotos/icon/campana.png";
import userPlaceholder from "/fotos/icon/user-icon.png";

const API = "http://localhost:3000";

// ==============================
// COMPONENTE — BOTÓN DEL SIDEBAR CON HIJOS
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

// Formulario vacío para registrar un empleado nuevo.
// No incluye cuenta: el empleado real la crea al registrarse.
const FORM_VACIO = {
  nombre: "", apellido: "", correo: "",
  documento: "", celular: ""
};

// ==============================
// COMPONENTE PRINCIPAL
// ==============================
function AdminGestionUsuarios() {
  const navigate = useNavigate();

  const [menuAbierto,  setMenuAbierto]  = useState(false);
  const [cargando,     setCargando]     = useState(true);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error,        setError]        = useState(null);

  const [usuario, setUsuario] = useState({ nombre: "", foto: "", rol: "" });
  const [botones, setBotones] = useState([]);

  const [usuarios,  setUsuarios]  = useState([]);
  const [expandida, setExpandida] = useState(null);

  // Datos del formulario de edición de la tarjeta expandida.
  const [editForm,  setEditForm]  = useState({});
  const [editFoto,  setEditFoto]  = useState(null);   // archivo nuevo de foto

  // Modal de creación.
  const [modalCrear, setModalCrear] = useState(false);
  const [crearForm,  setCrearForm]  = useState(FORM_VACIO);

  // ==============================
  // CARGA INICIAL
  // ==============================
  useEffect(() => {
    document.title = "ADMIN — GESTIÓN DE USUARIOS";
    const token = localStorage.getItem("token");

    const cargarSesion = async () => {
      try {
        setCargando(true);
        const res = await fetch(`${API}/auth/sesion`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) { navigate("/001"); return; }

        const data = await res.json();

        // Solo administradores/supervisores pueden ver esta página.
        if (data.usuario.rol !== "Administrador" && data.usuario.rol !== "Supervisor") {
          navigate("/100");
          return;
        }

        setUsuario({
          nombre: data.usuario.nombre,
          foto:   data.usuario.foto || null,
          rol:    data.usuario.rol
        });
        setBotones(data.botones);
      } catch (err) {
        console.error("Error al cargar sesión:", err);
        setError(".");
        setUsuario({ nombre: "Admin HANTER", foto: null, rol: "ADMINISTRADOR" });
        setBotones([
          { id: 1, nombre: "INICIO",         link: "/100", posicion: ["header", "sidebar"], hijos: [] },
          { id: 2, nombre: "CERTIFICADOS",   link: "/101", posicion: ["header", "sidebar"], hijos: [] },
          { id: 3, nombre: "NOMINA",         link: "/104", posicion: ["header", "sidebar"], hijos: [] },
          { id: 4, nombre: "CAPACITACIONES", link: "/125", posicion: ["header", "sidebar"], hijos: [] },
          { id: 7, nombre: "CONFIGURACIÓN",  link: "/config", posicion: ["sidebar"], hijos: [] },
        ]);
      } finally {
        setCargando(false);
      }
    };

    cargarSesion();
    cargarUsuarios();
  }, [navigate]);

  // ==============================
  // GET /admin/usuarios — lista todos los usuarios
  // ==============================
  const cargarUsuarios = async () => {
    try {
      setCargandoLista(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/usuarios`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Respuesta no OK");
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setUsuarios([]);
    } finally {
      setCargandoLista(false);
    }
  };

  const botonesHeader  = botones.filter(b => b.posicion.includes("header"));
  const botonesSidebar = botones.filter(b => b.posicion.includes("sidebar"));

  // Abre/cierra una tarjeta y precarga su formulario de edición.
  const toggleExpandida = (u) => {
    // Los administradores/supervisores no se pueden gestionar aquí.
    if (u.rol === "Administrador" || u.rol === "Supervisor") {
      alert("Los administradores no se pueden editar ni eliminar desde esta página.");
      return;
    }
    if (expandida === u.id_empleado) {
      setExpandida(null);
      return;
    }
    setExpandida(u.id_empleado);
    setEditFoto(null);
    setEditForm({
      nombre:         u.nombre || "",
      apellido:       u.apellido || "",
      correo:         u.correo || "",
      documento:      u.documento || "",
      celular:        u.celular || "",
      nombre_usuario: u.nombre_usuario || "",
      password:       ""
    });
  };

  // ==============================
  // PUT /admin/usuarios/:id — guardar cambios de un usuario
  // ==============================
  const handleGuardar = async (u) => {
    try {
      const token = localStorage.getItem("token");

      // 1) Si se eligió una foto nueva, subirla primero.
      if (editFoto) {
        const fd = new FormData();
        fd.append("foto", editFoto);
        const resFoto = await fetch(`${API}/admin/usuarios/${u.id_empleado}/foto`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` },
          body: fd
        });
        const dataFoto = await resFoto.json();
        if (!resFoto.ok) {
          alert(dataFoto.error || "Error al subir la foto.");
          return;
        }
      }

      // 2) Guardar el resto de los datos.
      const res = await fetch(`${API}/admin/usuarios/${u.id_empleado}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();

      if (res.ok) {
        alert("✓ Usuario actualizado correctamente.");
        setExpandida(null);
        setEditFoto(null);
        cargarUsuarios();
      } else {
        alert(data.error || "Error al guardar los cambios.");
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  // ==============================
  // DELETE /admin/usuarios/:id — eliminar un usuario
  // ==============================
  const handleEliminar = async (u) => {
    const ok = window.confirm(
      `¿Seguro que quieres eliminar a ${u.nombre} ${u.apellido}? Esta acción no se puede deshacer.`
    );
    if (!ok) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/usuarios/${u.id_empleado}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        alert("Usuario eliminado correctamente.");
        setExpandida(null);
        cargarUsuarios();
      } else {
        alert(data.error || "Error al eliminar el usuario.");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  // ==============================
  // POST /admin/usuarios — registra un empleado nuevo
  // Solo da de alta el empleado. El nombre de usuario y la
  // contraseña los define el propio empleado en la página 004.
  // ==============================
  const handleCrear = async () => {
    const f = crearForm;
    if (!f.nombre || !f.apellido || !f.correo || !f.documento || !f.celular) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(crearForm)
      });
      const data = await res.json();

      if (res.ok) {
        alert(
          "✓ Empleado registrado.\n\n" +
          "El usuario ya puede crear su cuenta y contraseña " +
          "desde la página de registro usando su correo."
        );
        setModalCrear(false);
        setCrearForm(FORM_VACIO);
        cargarUsuarios();
      } else {
        alert(data.error || "Error al registrar el empleado.");
      }
    } catch (err) {
      console.error("Error al crear:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="admin-usuarios-page">

      <div className="circuloFondo"></div>

      <div className="title">
        <h1>GESTIÓN<br />DE USUARIOS</h1>
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
            <button key={btn.id} onClick={() => navigate(btn.link)}>
              {btn.nombre}
            </button>
          ))
        )}
      </nav>

      <main className="main-content">
        {error && <p className="error-msg">{error}</p>}

        {/* Acciones superiores */}
        <div className="usuarios-acciones-top">
          <button className="btn-crear-usuario" onClick={() => setModalCrear(true)}>
            + AGREGAR USUARIO
          </button>
          <button className="btn-gestionar-cursos" onClick={() => navigate("/151-A")}>
            GESTIONAR CURSOS
          </button>
        </div>

        {/* Lista de usuarios */}
        <div className="usuarios-lista">
          {cargandoLista ? (
            <span className="loading-text">Cargando usuarios...</span>
          ) : usuarios.length === 0 ? (
            <p className="sin-usuarios">No hay usuarios registrados.</p>
          ) : (
            usuarios.map(u => (
              <div key={u.id_empleado} className="usuario-card">

                {/* Fila principal */}
                <div
                  className={`usuario-fila ${expandida === u.id_empleado ? "expandida" : ""}`}
                  onClick={() => toggleExpandida(u)}
                >
                  <div className="usuario-avatar">
                    <img src={u.foto || userPlaceholder} alt="Foto" />
                  </div>
                  <div className="usuario-info">
                    <span className="usuario-nombre">{u.nombre} {u.apellido}</span>
                    <span className="usuario-correo">{u.correo}</span>
                  </div>
                  {(u.rol === "Administrador" || u.rol === "Supervisor") && (
                    <span className="usuario-rol-badge">{u.rol}</span>
                  )}
                  {u.rol === "Usuario" && !u.nombre_usuario && (
                    <span className="usuario-pendiente-badge">Sin registrar</span>
                  )}
                  <span className="usuario-arrow">
                    {expandida === u.id_empleado ? "▲" : "▼"}
                  </span>
                </div>

                {/* Panel expandido — formulario de edición */}
                {expandida === u.id_empleado && (
                  <div className="usuario-detalle">

                    {/* Foto de perfil */}
                    <div className="campo-foto">
                      <img
                        src={
                          editFoto
                            ? URL.createObjectURL(editFoto)
                            : (u.foto || userPlaceholder)
                        }
                        alt="Perfil"
                        className="foto-preview"
                      />
                      <label className="btn-cambiar-foto">
                        Cambiar foto
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(e) => setEditFoto(e.target.files[0] || null)}
                        />
                      </label>
                    </div>

                    {/* Campos de texto */}
                    <label className="campo">
                      <span>Nombre</span>
                      <input
                        value={editForm.nombre}
                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                      />
                    </label>
                    <label className="campo">
                      <span>Apellido</span>
                      <input
                        value={editForm.apellido}
                        onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                      />
                    </label>
                    <label className="campo">
                      <span>Cédula</span>
                      <input
                        value={editForm.documento}
                        onChange={(e) => setEditForm({ ...editForm, documento: e.target.value })}
                      />
                    </label>
                    <label className="campo">
                      <span>Teléfono</span>
                      <input
                        value={editForm.celular}
                        onChange={(e) => setEditForm({ ...editForm, celular: e.target.value })}
                      />
                    </label>
                    <label className="campo">
                      <span>Correo</span>
                      <input
                        value={editForm.correo}
                        onChange={(e) => setEditForm({ ...editForm, correo: e.target.value })}
                      />
                    </label>
                    <label className="campo">
                      <span>Nombre de usuario</span>
                      <input
                        value={editForm.nombre_usuario}
                        onChange={(e) => setEditForm({ ...editForm, nombre_usuario: e.target.value })}
                        disabled={!u.nombre_usuario}
                      />
                    </label>
                    <label className="campo">
                      <span>Nueva contraseña (opcional)</span>
                      <input
                        type="password"
                        placeholder="Dejar vacío para no cambiarla"
                        value={editForm.password}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        disabled={!u.nombre_usuario}
                      />
                    </label>

                    {/* Botones */}
                    <div className="usuario-acciones">
                      <button
                        className="btn-guardar"
                        onClick={(e) => { e.stopPropagation(); handleGuardar(u); }}
                      >
                        ✓ GUARDAR
                      </button>
                      <button
                        className="btn-eliminar"
                        onClick={(e) => { e.stopPropagation(); handleEliminar(u); }}
                      >
                        ✕ ELIMINAR
                      </button>
                    </div>

                  </div>
                )}

              </div>
            ))
          )}
        </div>
      </main>

      {/* ========================= */}
      {/* MODAL — CREAR USUARIO     */}
      {/* ========================= */}
      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal-crear" onClick={(e) => e.stopPropagation()}>
            <h2>NUEVO USUARIO</h2>

            <p className="modal-nota">
              Se registran solo los datos del empleado. El usuario
              creará su cuenta y contraseña al registrarse con su correo.
            </p>

            <label className="campo">
              <span>Nombre</span>
              <input
                value={crearForm.nombre}
                onChange={(e) => setCrearForm({ ...crearForm, nombre: e.target.value })}
              />
            </label>
            <label className="campo">
              <span>Apellido</span>
              <input
                value={crearForm.apellido}
                onChange={(e) => setCrearForm({ ...crearForm, apellido: e.target.value })}
              />
            </label>
            <label className="campo">
              <span>Cédula</span>
              <input
                value={crearForm.documento}
                onChange={(e) => setCrearForm({ ...crearForm, documento: e.target.value })}
              />
            </label>
            <label className="campo">
              <span>Teléfono</span>
              <input
                value={crearForm.celular}
                onChange={(e) => setCrearForm({ ...crearForm, celular: e.target.value })}
              />
            </label>
            <label className="campo">
              <span>Correo</span>
              <input
                value={crearForm.correo}
                onChange={(e) => setCrearForm({ ...crearForm, correo: e.target.value })}
              />
            </label>

            <div className="modal-acciones">
              <button className="btn-guardar" onClick={handleCrear}>
                ✓ REGISTRAR
              </button>
              <button
                className="btn-cancelar"
                onClick={() => { setModalCrear(false); setCrearForm(FORM_VACIO); }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
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
            <SidebarBtn
              key={btn.id}
              btn={btn}
              navigate={navigate}
              cerrarMenu={() => setMenuAbierto(false)}
            />
          ))}
        </nav>
      </aside>

      {menuAbierto && <div className="overlay" onClick={() => setMenuAbierto(false)} />}

      <div className="cGDecor-1"></div>
      <div className="cGDecor-2"></div>

    </div>
  );
}

export default AdminGestionUsuarios;