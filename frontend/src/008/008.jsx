// ==============================
// IMPORTACIONES
// ==============================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './008.css';


// ============================================================
// OPCIONES DE CALIFICACIÓN
// ============================================================

const CALIFICACIONES = ['SUPERIOR', 'ALTO', 'MEDIO', 'BAJO'];


// ============================================================
// COMPONENTE CALIFICAR SISTEMA
// ============================================================

function CalificarSistema() {

  // Estado de la calificación seleccionada
  const [calificacion, setCalificacion] = useState(null);

  // Estado del comentario adicional
  const [comentario, setComentario] = useState('');

  // Estado de envío
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Cambia el título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Calificar Sistema";
  }, []);


  // ============================================================
  // MANEJO DEL ENVÍO DEL FORMULARIO
  // ============================================================

  const handleEnviar = async () => {

    // Validar que se haya seleccionado una calificación
    if (!calificacion) {
      alert('Por favor selecciona una calificación antes de enviar.');
      return;
    }

    setCargando(true);

    try {
      const response = await fetch('http://localhost:3000/calificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calificacion,
          comentario: comentario.trim(),
        }),
      });

      if (response.ok) {
        setEnviado(true);
        setCalificacion(null);
        setComentario('');
      } else {
        alert('Ocurrió un error al enviar. Inténtalo de nuevo.');
      }

    } catch (error) {
      console.error('Error al enviar calificación:', error);
      alert('No se pudo conectar con el servidor. Inténtalo más tarde.');
    } finally {
      setCargando(false);
    }
  };


  // ============================================================
  // ESTRUCTURA VISUAL (JSX)
  // ============================================================
  return (
    <div className="calificar-page">
      <div className="circuloFondo">

        {/* Botón regresar */}
        <Link to="/007" className="back-btn">
          ←
        </Link>

        {/* Título principal */}
        <div className="title">
          <h1>SOPORTE<br />TÉCNICO</h1>
        </div>

        {/* Subtítulo */}
        <p className="calificar-subtitulo">
          CALIFICA TU EXPERIENCIA<br />CON NUESTRO SERVICIO
        </p>

        {/* Contenedor del formulario */}
        <div className="calificar-contenedor">

          {/* Mensaje de éxito tras enviar */}
          {enviado && (
            <p className="calificar-exito">
              ✅ ¡Gracias por tu calificación!
            </p>
          )}

          {/* Botones de calificación */}
          <div className="calificar-opciones">
            {CALIFICACIONES.map((opcion) => (
              <button
                key={opcion}
                className={`btn-calificacion ${calificacion === opcion ? 'seleccionado' : ''}`}
                onClick={() => setCalificacion(opcion)}
              >
                {opcion}
              </button>
            ))}
          </div>

          {/* Campo de comentario */}
          <textarea
            className="calificar-textarea"
            placeholder="ESCRIBE UN COMENTARIO ADICIONAL..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={300}
          />

          {/* Botón enviar */}
          <button
            className="btn-enviar"
            onClick={handleEnviar}
            disabled={cargando}
          >
            {cargando ? 'ENVIANDO...' : 'ENVIAR'}
          </button>

        </div>

        {/* Elementos decorativos */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>

      </div>
    </div>
  );
}

// Exportación del componente para poder usarlo en main.jsx
export default CalificarSistema;
