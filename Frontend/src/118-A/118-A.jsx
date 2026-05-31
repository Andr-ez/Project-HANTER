import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./118-A.css";

import userIcon from "/fotos/icon/user-icon.png";
import weekIcon from "/fotos/icon/week-icon.png";
import keyIcon  from "/fotos/icon/gancho-icon.png";

function EnviarNominaAdmin() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  const [enviando,      setEnviando]      = useState(false);
  const [empleados,     setEmpleados]     = useState([]);
  const [archivoPDF,    setArchivoPDF]    = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const inputFileRef = useRef(null);

  const [formData, setFormData] = useState({
    id_empleado: "", fechaNomina: "",
    salarioBase: "", deducciones: "", totalBonos: "", totalPago: "",
  });

  useEffect(() => {
    document.title = "ENVIAR NÓMINA";
    const token = localStorage.getItem("token");

    const cargarEmpleados = async () => {
      try {
        const res = await fetch("http://localhost:3000/empleados", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error del servidor");
        setEmpleados(await res.json());
      } catch (err) {
        console.error("Error al cargar empleados:", err);
        setEmpleados([]);
      }
    };

    cargarEmpleados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const act = { ...prev, [name]: value };
      if (["salarioBase", "deducciones", "totalBonos"].includes(name)) {
        const s = Number(act.salarioBase) || 0;
        const d = Number(act.deducciones) || 0;
        const b = Number(act.totalBonos)  || 0;
        act.totalPago = String(s + b - d);
      }
      return act;
    });
  };

  const handleArchivoSeleccionado = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (archivo.type !== "application/pdf") { alert("Solo se permiten archivos PDF."); return; }
    setArchivoPDF(archivo);
    setNombreArchivo(archivo.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.id_empleado) { alert("Debes seleccionar un empleado."); return; }
    if (!formData.fechaNomina) { alert("Debes indicar la fecha (mes) de la nómina."); return; }
    if (!archivoPDF) { alert("Debes adjuntar el archivo PDF de la nómina."); return; }

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
      formPayload.append("archivo",      archivoPDF);

      const response = await fetch("http://localhost:3000/nomina/enviar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });
      const data = await response.json();
      if (response.ok) {
        alert("✓ La nómina fue enviada y el empleado fue notificado.");
        setFormData({ id_empleado: "", fechaNomina: "", salarioBase: "", deducciones: "", totalBonos: "", totalPago: "" });
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

  return (
    <div className="enviar-nomina-page">
      <AppShell
        title="ENVIAR NÓMINA"
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/104"
      >
        <form className="nomina-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="field-label">EMPLEADO</label>
            <div className="input-group">
              <img src={userIcon} alt="Empleado" />
              <select name="id_empleado" value={formData.id_empleado} onChange={handleChange} required>
                <option value="">SELECCIONA UN EMPLEADO</option>
                {empleados.map(emp => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre} {emp.apellido}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">FECHA DE NÓMINA (MES)</label>
            <div className="input-group">
              <img src={weekIcon} alt="Fecha" />
              <input type="month" name="fechaNomina" value={formData.fechaNomina} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">SALARIO BASE</label>
            <div className="input-group">
              <img src={userIcon} alt="Salario" />
              <input type="number" name="salarioBase" placeholder="EJEMPLO: 2300000"
                value={formData.salarioBase} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">DEDUCCIONES</label>
            <div className="input-group">
              <img src={userIcon} alt="Deducciones" />
              <input type="number" name="deducciones" placeholder="EJEMPLO: 150000"
                value={formData.deducciones} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">TOTAL EN BONOS</label>
            <div className="input-group">
              <img src={userIcon} alt="Bonos" />
              <input type="number" name="totalBonos" placeholder="EJEMPLO: 100000"
                value={formData.totalBonos} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-field">
            <label className="field-label">VALOR TOTAL DEL PAGO</label>
            <div className="input-group">
              <img src={userIcon} alt="Total" />
              <input type="number" name="totalPago" placeholder="SE CALCULA AUTOMÁTICO"
                value={formData.totalPago} onChange={handleChange} min="0" />
            </div>
            <span className="ayuda-total">* Se calcula solo (salario + bonos − deducciones), pero puedes editarlo.</span>
          </div>
          <div className="form-field">
            <label className="field-label">ADJUNTAR PDF DE LA NÓMINA</label>
            <input ref={inputFileRef} type="file" accept="application/pdf"
              style={{ display: "none" }} onChange={handleArchivoSeleccionado} />
            <div className="pdf-adjuntar">
              <img src={keyIcon} alt="Adjuntar PDF" className="gancho-icon"
                onClick={() => inputFileRef.current.click()} title="Haz clic para adjuntar el PDF" />
              {nombreArchivo
                ? <span className="nombre-archivo">{nombreArchivo}</span>
                : <span className="nombre-archivo placeholder-archivo">Ningún archivo seleccionado</span>}
            </div>
          </div>
          <button type="submit" className="btn-enviar-nomina" disabled={enviando}>
            {enviando ? "ENVIANDO..." : "ENVIAR NÓMINA AL EMPLEADO"}
          </button>
        </form>
      </AppShell>
    </div>
  );
}

export default EnviarNominaAdmin;