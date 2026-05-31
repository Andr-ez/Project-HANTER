import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./125-A.css";

const TIPOS_CURSO = [
  "HERRAMIENTAS OFIMÁTICAS", "HABILIDADES BLANDAS", "TECNOLOGÍA",
  "IDIOMAS", "ADMINISTRACIÓN", "SALUD Y SEGURIDAD",
];

function AdminCrearCurso() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  const [nombre,      setNombre]      = useState("");
  const [tipo,        setTipo]        = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando,    setEnviando]    = useState(false);
  const [exito,       setExito]       = useState(false);

  useEffect(() => { document.title = "ADMIN — CREAR CURSO"; }, []);

  const handleCrearCurso = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !tipo || !fechaInicio) {
      alert("Completa el nombre, el tipo y la fecha de inicio del curso.");
      return;
    }
    setEnviando(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: nombre.trim(), tipo, fecha_inicio: fechaInicio, descripcion: descripcion.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setExito(true);
        setNombre(""); setTipo(""); setFechaInicio(""); setDescripcion("");
      } else {
        alert(data.error || "Error al crear el curso.");
      }
    } catch (err) {
      console.error("Error al crear curso:", err);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="admin-crear-curso-page">
      <AppShell
        title={"AGREGAR\nNUEVO CURSO"}
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/125"
      >
        {!exito ? (
          <form className="curso-form" onSubmit={handleCrearCurso}>
            <label className="curso-label">
              NOMBRE DEL CURSO
              <input type="text" className="curso-input" placeholder="Ej: Excel Avanzado"
                value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label className="curso-label">
              TIPO DE CURSO
              <select className="curso-input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Selecciona un tipo...</option>
                {TIPOS_CURSO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="curso-label">
              FECHA DE INICIO
              <input type="date" className="curso-input" value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)} />
            </label>
            <label className="curso-label">
              DESCRIPCIÓN (OPCIONAL)
              <textarea className="curso-textarea" placeholder="Breve descripción del curso..."
                value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} />
            </label>
            <button type="submit" className="curso-submit-btn" disabled={enviando}>
              {enviando ? "CREANDO..." : "CREAR CURSO"}
            </button>
          </form>
        ) : (
          <div className="curso-exito">
            <div className="curso-exito-icono">✓</div>
            <p className="curso-exito-titulo">¡CURSO CREADO!</p>
            <p className="curso-exito-texto">El curso ya está disponible para que los empleados se inscriban.</p>
            <div className="curso-exito-acciones">
              <button className="curso-submit-btn" onClick={() => setExito(false)}>CREAR OTRO</button>
              <button className="curso-submit-btn secundario" onClick={() => navigate("/126-A")}>VER SOLICITUDES</button>
            </div>
          </div>
        )}
      </AppShell>
      <div className="cGDecor-3"></div>
    </div>
  );
}

export default AdminCrearCurso;