import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./151-A.css";

const API = "http://localhost:3000";

const ETIQUETA_ESTADO = {
  MATRICULADO: "Matriculado",
  EN_PROGRESO: "En progreso",
  COMPLETADO:  "Completado"
};

function AdminCursosUsuarios() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  const [cargandoLista, setCargandoLista] = useState(true);
  const [inscripciones, setInscripciones] = useState([]);
  const [expandida,     setExpandida]     = useState(null);

  useEffect(() => { document.title = "ADMIN — CURSOS DE USUARIOS"; }, []);

  const cargarInscripciones = async () => {
    try {
      setCargandoLista(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/cursos/inscripciones/activas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Respuesta no OK");
      setInscripciones(await res.json());
    } catch (err) {
      console.error("Error al cargar inscripciones:", err);
      setInscripciones([]);
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => { cargarInscripciones(); }, []);

  const cambiarEstado = async (insc, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/cursos/inscripciones/${insc.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (res.ok) {
        alert(nuevoEstado === "COMPLETADO"
          ? "✓ Curso marcado como completado. El empleado fue notificado."
          : "✓ Curso marcado como en progreso. El empleado fue notificado.");
        cargarInscripciones();
      } else {
        alert(data.error || "Error al actualizar el estado.");
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="admin-cursos-page">
      <AppShell
        title={"CURSOS\nDE USUARIOS"}
        usuario={usuario}
        botones={botones}
        cargando={cargando}
      >
        <p className="cursos-subtitulo">Actualiza el avance de los cursos de cada empleado.</p>

        <div className="cursos-lista">
          {cargandoLista ? (
            <span className="loading-text">Cargando cursos...</span>
          ) : inscripciones.length === 0 ? (
            <p className="sin-cursos">No hay cursos activos de usuarios.</p>
          ) : (
            inscripciones.map(insc => (
              <div key={insc.id} className="curso-card">
                <div className={`curso-fila ${expandida === insc.id ? "expandida" : ""}`}
                  onClick={() => setExpandida(expandida === insc.id ? null : insc.id)}>
                  <div className="curso-info">
                    <span className="curso-empleado">{insc.nombre_empleado}</span>
                    <span className="curso-nombre">CURSO DE {insc.nombre_curso}</span>
                  </div>
                  <span className={`curso-estado-badge estado-${insc.estado}`}>
                    {ETIQUETA_ESTADO[insc.estado] || insc.estado}
                  </span>
                  <span className="curso-arrow">{expandida === insc.id ? "▲" : "▼"}</span>
                </div>
                {expandida === insc.id && (
                  <div className="curso-detalle">
                    <div className="curso-datos">
                      <p><strong>Empleado:</strong> {insc.nombre_empleado}</p>
                      <p><strong>Curso:</strong> {insc.nombre_curso}</p>
                      <p><strong>Inicio del curso:</strong> {insc.fecha_inicio}</p>
                      <p><strong>Estado actual:</strong> {ETIQUETA_ESTADO[insc.estado] || insc.estado}</p>
                    </div>
                    <div className="curso-acciones">
                      <button className="btn-en-progreso"
                        disabled={insc.estado === "EN_PROGRESO"}
                        onClick={(e) => { e.stopPropagation(); cambiarEstado(insc, "EN_PROGRESO"); }}>
                        ⟳ EN PROGRESO
                      </button>
                      <button className="btn-completado"
                        disabled={insc.estado === "COMPLETADO"}
                        onClick={(e) => { e.stopPropagation(); cambiarEstado(insc, "COMPLETADO"); }}>
                        ✓ COMPLETADO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </AppShell>
    </div>
  );
}

export default AdminCursosUsuarios;