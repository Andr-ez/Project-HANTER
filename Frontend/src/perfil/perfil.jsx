import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./perfil.css";

import userPlaceholder from "/fotos/icon/user-icon.png";

function formatFecha(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function Perfil() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();
  const fileRef = useRef(null);

  const [perfil,          setPerfil]          = useState(null);
  const [cargandoPerfil,  setCargandoPerfil]  = useState(true);
  const [errorPerfil,     setErrorPerfil]     = useState(null);
  const [uploadStatus,    setUploadStatus]    = useState({ msg: "", tipo: "" });
  const [subiendo,        setSubiendo]        = useState(false);
  const [nuevoNombre,     setNuevoNombre]     = useState("");
  const [nombreMsg,       setNombreMsg]       = useState({ msg: "", tipo: "" });
  const [guardandoNombre, setGuardandoNombre] = useState(false);

  useEffect(() => {
    document.title = "MI PERFIL";
    const token = localStorage.getItem("token");

    const cargarPerfil = async () => {
      try {
        setCargandoPerfil(true);
        const res = await fetch("http://localhost:3000/usuarios/perfil", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al obtener perfil");
        const data = await res.json();
        setPerfil(data);
        setNuevoNombre(data.nombre_usuario);
      } catch (err) {
        console.error(err);
        setErrorPerfil("No se pudo cargar el perfil. Intenta de nuevo.");
      } finally {
        setCargandoPerfil(false);
      }
    };

    cargarPerfil();
  }, []);

  const handleFotoChange = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setSubiendo(true);
    setUploadStatus({ msg: "Subiendo foto...", tipo: "" });
    const formData = new FormData();
    formData.append("foto", archivo);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/usuarios/perfil/foto", {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir foto");
      setPerfil(prev => ({ ...prev, empleado: { ...prev.empleado, foto_perfil: data.foto_url } }));
      setUploadStatus({ msg: "✓ Foto actualizada", tipo: "" });
      setTimeout(() => setUploadStatus({ msg: "", tipo: "" }), 3000);
    } catch (err) {
      setUploadStatus({ msg: err.message, tipo: "error" });
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  };

  const handleCambiarNombre = async () => {
    if (!nuevoNombre.trim() || nuevoNombre.trim() === perfil.nombre_usuario) {
      setNombreMsg({ msg: "Escribe un nombre diferente al actual", tipo: "error" }); return;
    }
    setGuardandoNombre(true);
    setNombreMsg({ msg: "", tipo: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/usuarios/perfil/nombre", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  return (
    <div className="perfil-page">
      <AppShell
        title="MI PERFIL"
        usuario={usuario}
        botones={botones}
        cargando={cargando}
      >
        {cargandoPerfil && <div className="perfil-loading">CARGANDO PERFIL...</div>}
        {errorPerfil && !cargandoPerfil && <p className="perfil-error-msg">{errorPerfil}</p>}

        {perfil && !cargandoPerfil && (
          <div className="perfil-scroll">
            <div className="perfil-card-hero">
              <div className="perfil-avatar-wrap"
                onClick={() => fileRef.current?.click()}
                title="Haz clic para cambiar tu foto de perfil">
                <img src={perfil.empleado.foto_perfil || userPlaceholder} alt="Foto de perfil" />
                <div className="perfil-avatar-overlay">
                  <span>{subiendo ? "SUBIENDO..." : "CAMBIAR FOTO"}</span>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*"
                className="perfil-file-input" onChange={handleFotoChange} />
              <p className="perfil-hero-nombre">{perfil.empleado.nombre} {perfil.empleado.apellido}</p>
              <p className="perfil-hero-rol">{perfil.empleado.rol}</p>
              <span className="perfil-hero-id">ID #{perfil.id_usuario}</span>
              <p className={`perfil-upload-status ${uploadStatus.tipo}`}>{uploadStatus.msg}</p>
            </div>

            <div className="perfil-grid">
              {[
                { icon: "✉", label: "CORREO",            valor: perfil.empleado.correo },
                { icon: "📱", label: "TELÉFONO",         valor: perfil.empleado.celular },
                { icon: "🪪", label: "N° IDENTIFICACIÓN", valor: perfil.empleado.documento },
                { icon: "👤", label: "NOMBRE DE USUARIO", valor: perfil.nombre_usuario },
                { icon: "📅", label: "FECHA DE REGISTRO", valor: formatFecha(perfil.empleado.fecha_ingreso) },
                { icon: "🕐", label: "ÚLTIMO ACCESO",     valor: formatFecha(perfil.ultimo_login) },
              ].map(({ icon, label, valor }) => (
                <div key={label} className="perfil-campo">
                  <div className="perfil-campo-label">
                    <span className="perfil-campo-label-icon">{icon}</span>{label}
                  </div>
                  <div className="perfil-campo-valor">{valor}</div>
                </div>
              ))}
            </div>

            <div className="perfil-cambiar-nombre">
              <p className="perfil-cambiar-titulo">CAMBIAR NOMBRE DE USUARIO</p>
              <div className="perfil-nombre-form">
                <input className="perfil-nombre-input" type="text"
                  value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Nuevo nombre de usuario"
                  onKeyDown={e => e.key === "Enter" && handleCambiarNombre()} />
                <button className="perfil-nombre-btn" onClick={handleCambiarNombre} disabled={guardandoNombre}>
                  {guardandoNombre ? "GUARDANDO..." : "GUARDAR"}
                </button>
              </div>
              <p className={`perfil-nombre-msg ${nombreMsg.tipo}`}>{nombreMsg.msg}</p>
            </div>
          </div>
        )}
      </AppShell>
    </div>
  );
}

export default Perfil;