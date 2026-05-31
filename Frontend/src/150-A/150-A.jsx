import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./150-A.css";

import userPlaceholder from "/fotos/icon/user-icon.png";

const API = "http://localhost:3000";

const FORM_VACIO = { nombre: "", apellido: "", correo: "", documento: "", celular: "" };

function AdminGestionUsuarios() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  const [cargandoLista, setCargandoLista] = useState(true);
  const [usuarios,      setUsuarios]      = useState([]);
  const [expandida,     setExpandida]     = useState(null);
  const [editForm,      setEditForm]      = useState({});
  const [editFoto,      setEditFoto]      = useState(null);
  const [modalCrear,    setModalCrear]    = useState(false);
  const [crearForm,     setCrearForm]     = useState(FORM_VACIO);

  useEffect(() => { document.title = "ADMIN — GESTIÓN DE USUARIOS"; }, []);

  const cargarUsuarios = async () => {
    try {
      setCargandoLista(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Respuesta no OK");
      setUsuarios(await res.json());
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setUsuarios([]);
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const toggleExpandida = (u) => {
    if (u.rol === "Administrador" || u.rol === "Supervisor") {
      alert("Los administradores no se pueden editar ni eliminar desde esta página.");
      return;
    }
    if (expandida === u.id_empleado) { setExpandida(null); return; }
    setExpandida(u.id_empleado);
    setEditFoto(null);
    setEditForm({
      nombre: u.nombre || "", apellido: u.apellido || "", correo: u.correo || "",
      documento: u.documento || "", celular: u.celular || "",
      nombre_usuario: u.nombre_usuario || "", password: ""
    });
  };

  const handleGuardar = async (u) => {
    try {
      const token = localStorage.getItem("token");
      if (editFoto) {
        const fd = new FormData();
        fd.append("foto", editFoto);
        const resFoto = await fetch(`${API}/admin/usuarios/${u.id_empleado}/foto`, {
          method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: fd
        });
        const dataFoto = await resFoto.json();
        if (!resFoto.ok) { alert(dataFoto.error || "Error al subir la foto."); return; }
      }
      const res = await fetch(`${API}/admin/usuarios/${u.id_empleado}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert("✓ Usuario actualizado correctamente.");
        setExpandida(null); setEditFoto(null); cargarUsuarios();
      } else {
        alert(data.error || "Error al guardar los cambios.");
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const handleEliminar = async (u) => {
    if (!window.confirm(`¿Seguro que quieres eliminar a ${u.nombre} ${u.apellido}? Esta acción no se puede deshacer.`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/usuarios/${u.id_empleado}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { alert("Usuario eliminado correctamente."); setExpandida(null); cargarUsuarios(); }
      else alert(data.error || "Error al eliminar el usuario.");
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  const handleCrear = async () => {
    const f = crearForm;
    if (!f.nombre || !f.apellido || !f.correo || !f.documento || !f.celular) {
      alert("Todos los campos son obligatorios."); return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/admin/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(crearForm)
      });
      const data = await res.json();
      if (res.ok) {
        alert("✓ Empleado registrado.\n\nEl usuario ya puede crear su cuenta y contraseña desde la página de registro usando su correo.");
        setModalCrear(false); setCrearForm(FORM_VACIO); cargarUsuarios();
      } else {
        alert(data.error || "Error al registrar el empleado.");
      }
    } catch (err) {
      console.error("Error al crear:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="admin-usuarios-page">
      <AppShell
        title={"GESTIÓN\nDE USUARIOS"}
        usuario={usuario}
        botones={botones}
        cargando={cargando}
      >
        <div className="usuarios-acciones-top">
          <button className="btn-crear-usuario" onClick={() => setModalCrear(true)}>+ AGREGAR USUARIO</button>
          <button className="btn-gestionar-cursos" onClick={() => navigate("/151-A")}>GESTIONAR CURSOS</button>
        </div>

        <div className="usuarios-lista">
          {cargandoLista ? (
            <span className="loading-text">Cargando usuarios...</span>
          ) : usuarios.length === 0 ? (
            <p className="sin-usuarios">No hay usuarios registrados.</p>
          ) : (
            usuarios.map(u => (
              <div key={u.id_empleado} className="usuario-card">
                <div className={`usuario-fila ${expandida === u.id_empleado ? "expandida" : ""}`}
                  onClick={() => toggleExpandida(u)}>
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
                  <span className="usuario-arrow">{expandida === u.id_empleado ? "▲" : "▼"}</span>
                </div>

                {expandida === u.id_empleado && (
                  <div className="usuario-detalle">
                    <div className="campo-foto">
                      <img src={editFoto ? URL.createObjectURL(editFoto) : (u.foto || userPlaceholder)}
                        alt="Perfil" className="foto-preview" />
                      <label className="btn-cambiar-foto">
                        Cambiar foto
                        <input type="file" accept="image/*" hidden
                          onChange={(e) => setEditFoto(e.target.files[0] || null)} />
                      </label>
                    </div>
                    {[
                      { key: "nombre",         label: "Nombre" },
                      { key: "apellido",       label: "Apellido" },
                      { key: "documento",      label: "Cédula" },
                      { key: "celular",        label: "Teléfono" },
                      { key: "correo",         label: "Correo" },
                      { key: "nombre_usuario", label: "Nombre de usuario", disabled: !u.nombre_usuario },
                    ].map(({ key, label, disabled }) => (
                      <label key={key} className="campo">
                        <span>{label}</span>
                        <input value={editForm[key] || ""} disabled={disabled}
                          onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
                      </label>
                    ))}
                    <label className="campo">
                      <span>Nueva contraseña (opcional)</span>
                      <input type="password" placeholder="Dejar vacío para no cambiarla"
                        value={editForm.password || ""} disabled={!u.nombre_usuario}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                    </label>
                    <div className="usuario-acciones">
                      <button className="btn-guardar"
                        onClick={(e) => { e.stopPropagation(); handleGuardar(u); }}>
                        ✓ GUARDAR
                      </button>
                      <button className="btn-eliminar"
                        onClick={(e) => { e.stopPropagation(); handleEliminar(u); }}>
                        ✕ ELIMINAR
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </AppShell>

      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div className="modal-crear" onClick={(e) => e.stopPropagation()}>
            <h2>NUEVO USUARIO</h2>
            <p className="modal-nota">
              Se registran solo los datos del empleado. El usuario creará su cuenta
              y contraseña al registrarse con su correo.
            </p>
            {["nombre", "apellido", "documento", "celular", "correo"].map(key => (
              <label key={key} className="campo">
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                <input value={crearForm[key]}
                  onChange={(e) => setCrearForm({ ...crearForm, [key]: e.target.value })} />
              </label>
            ))}
            <div className="modal-acciones">
              <button className="btn-guardar" onClick={handleCrear}>✓ REGISTRAR</button>
              <button className="btn-cancelar"
                onClick={() => { setModalCrear(false); setCrearForm(FORM_VACIO); }}>
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGestionUsuarios;