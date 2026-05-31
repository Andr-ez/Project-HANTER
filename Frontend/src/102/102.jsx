import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./102.css";

import userIcon from "/fotos/icon/user-icon.png";
import weekIcon from "/fotos/icon/week-icon.png";
import keyIcon  from "/fotos/icon/gancho-icon.png";

function AnadirCertificado() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  const [enviando,      setEnviando]      = useState(false);
  const [formData,      setFormData]      = useState({ institucion: "", fechaCertificacion: "", titulo: "" });
  const [archivoPDF,    setArchivoPDF]    = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const inputFileRef = useRef(null);

  useEffect(() => { document.title = "AÑADIR CERTIFICADO"; }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleArchivoSeleccionado = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (archivo.type !== "application/pdf") { alert("Solo se permiten archivos PDF."); return; }
    setArchivoPDF(archivo);
    setNombreArchivo(archivo.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.institucion.trim()) { alert("El nombre de la institución es obligatorio."); return; }
    if (!formData.fechaCertificacion.trim()) { alert("La fecha de certificación es obligatoria."); return; }
    if (!formData.titulo.trim()) { alert("El título es obligatorio."); return; }
    if (!archivoPDF) { alert("Debes adjuntar el archivo PDF del certificado."); return; }

    try {
      setEnviando(true);
      const token = localStorage.getItem("token");
      const formPayload = new FormData();
      formPayload.append("titulo",              formData.titulo);
      formPayload.append("institucion",         formData.institucion);
      formPayload.append("fecha_certificacion", formData.fechaCertificacion);
      formPayload.append("archivo",             archivoPDF);

      const response = await fetch("http://localhost:3000/certificados/anadir", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

  return (
    <div className="anadir-cert-page">
      <AppShell
        title={"AÑADIR\nCERTFICADO"}
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/101"
      >
        <form className="cert-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="field-label">NOMBRE DE LA INSTITUCIÓN</label>
            <div className="input-group">
              <img src={userIcon} alt="Institución" />
              <input type="text" name="institucion" placeholder="EJEMPLO: SENA SERVICIO NACIONAL"
                value={formData.institucion} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">FECHA DE LA CERTIFICACIÓN</label>
            <div className="input-group">
              <img src={weekIcon} alt="Fecha" />
              <input type="text" name="fechaCertificacion" placeholder="DD/MM/AA"
                value={formData.fechaCertificacion} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">TÍTULO</label>
            <div className="input-group">
              <img src={userIcon} alt="Título" />
              <input type="text" name="titulo" placeholder="EJEMPLO: ANALISTA DE SOFTWARE"
                value={formData.titulo} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">ADJUNTAR ARCHIVO PDF DEL CERTIFICADO</label>
            <input ref={inputFileRef} type="file" accept="application/pdf"
              style={{ display: "none" }} onChange={handleArchivoSeleccionado} />
            <div className="pdf-adjuntar">
              <img src={keyIcon} alt="Adjuntar PDF" className="gancho-icon"
                onClick={() => inputFileRef.current.click()} title="Haz clic para adjuntar tu PDF" />
              {nombreArchivo
                ? <span className="nombre-archivo">{nombreArchivo}</span>
                : <span className="nombre-archivo placeholder-archivo">Ningún archivo seleccionado</span>}
            </div>
          </div>
          <p className="aviso-revision">
            * Tu certificado quedará <strong>pendiente de aprobación</strong> hasta que un administrador lo revise.
          </p>
          <button type="submit" className="btn-anadir" disabled={enviando}>
            {enviando ? "ENVIANDO..." : "AÑADIR CERTIFICADO A\nTU BASE DE DATOS"}
          </button>
        </form>
      </AppShell>
    </div>
  );
}

export default AnadirCertificado;