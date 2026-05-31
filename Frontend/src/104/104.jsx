import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./104.css";

function formatearPesos(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CO");
}

function Nomina() {
  const navigate = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  const [cargandoNomina, setCargandoNomina] = useState(true);
  const [nominas,        setNominas]        = useState([]);
  const [seleccionados,  setSeleccionados]  = useState([]);
  const [filtroAbierto,  setFiltroAbierto]  = useState(false);
  const [filtroActivo,   setFiltroActivo]   = useState(null);
  const filtroRef = useRef(null);

  const esAdmin = usuario.rol === "Administrador" || usuario.rol === "Supervisor";

  useEffect(() => {
    document.title = "NÓMINA";
    const token = localStorage.getItem("token");

    const cargarNominas = async () => {
      try {
        setCargandoNomina(true);
        const res = await fetch("http://localhost:3000/nomina", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setNominas(await res.json());
        else throw new Error("Respuesta no OK del servidor.");
      } catch (err) {
        console.error("Error al cargar nóminas:", err);
        setNominas([]);
      } finally {
        setCargandoNomina(false);
      }
    };

    cargarNominas();
  }, []);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target)) setFiltroAbierto(false);
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const nominasFiltradas = [...nominas].sort((a, b) => {
    if (filtroActivo === "reciente")    return new Date(b.fecha) - new Date(a.fecha);
    if (filtroActivo === "antigua")     return new Date(a.fecha) - new Date(b.fecha);
    if (filtroActivo === "bonos-mayor") return b.bonos - a.bonos;
    if (filtroActivo === "bonos-menor") return a.bonos - b.bonos;
    return 0;
  });

  const toggleSeleccion  = (id) => setSeleccionados(prev =>
    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const estaSeleccionado = (id) => seleccionados.includes(id);

  const handleDescargar = () => {
    if (seleccionados.length === 0) { alert("Selecciona al menos una nómina para descargar."); return; }
    seleccionados.forEach(id => {
      const nomina = nominas.find(n => n.id === id);
      if (!nomina) return;
      const link = document.createElement("a");
      link.href = nomina.ruta_pdf;
      link.download = `nomina-${nomina.mes.toLowerCase()}-${nomina.anio}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="nomina-page">
      <AppShell
        title="NOMINA"
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/104"
      >
        {esAdmin && (
          <button className="btn-enviar-nomina-admin" onClick={() => navigate("/118-A")}>
            + ENVIAR NÓMINA A UN EMPLEADO
          </button>
        )}

        <div className="filtro-wrapper nomina-filtro-wrapper" ref={filtroRef}>
          <button className={`filtro-btn ${filtroActivo ? "activo" : ""}`}
            onClick={() => setFiltroAbierto(prev => !prev)}>
            FILTRAR POR <span className="filtro-icono nomina-filtro-icono">▼</span>
          </button>
          {filtroAbierto && (
            <div className="filtro-dropdown nomina-filtro-dropdown">
              {[
                { key: "reciente",    label: "MAS RECIENTE" },
                { key: "antigua",     label: "MAS ANTIGUA" },
                { key: "bonos-mayor", label: "VALOR DE BONOS MAYOR A MENOR" },
                { key: "bonos-menor", label: "VALOR DE BONOS MENOR A MAYOR" },
              ].map(op => (
                <button key={op.key}
                  className={`filtro-opcion ${filtroActivo === op.key ? "seleccionada" : ""}`}
                  onClick={() => { setFiltroActivo(filtroActivo === op.key ? null : op.key); setFiltroAbierto(false); }}>
                  {op.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nomina-lista">
          {cargandoNomina ? (
            <span className="loading-text">Cargando nómina...</span>
          ) : nominasFiltradas.length === 0 ? (
            <p className="sin-nominas">No hay registros de nómina disponibles.</p>
          ) : (
            nominasFiltradas.map(nomina => (
              <div key={nomina.id}
                className={`nomina-item ${estaSeleccionado(nomina.id) ? "seleccionado" : ""}`}
                onClick={() => toggleSeleccion(nomina.id)}>
                <span className={`nomina-radio ${estaSeleccionado(nomina.id) ? "marcado" : ""}`}></span>
                <div className="nomina-item-content">
                  <span className="nomina-mes">{nomina.mes} {nomina.anio}</span>
                  <div className="nomina-fila">
                    <span className="nomina-label">SALARIO</span>
                    <span className="nomina-puntos"></span>
                    <span className="nomina-valor">{formatearPesos(nomina.salario)}</span>
                  </div>
                  <div className="nomina-fila">
                    <span className="nomina-label">BONOS</span>
                    <span className="nomina-puntos"></span>
                    <span className="nomina-valor">{formatearPesos(nomina.bonos)}</span>
                  </div>
                  <div className="nomina-fila">
                    <span className="nomina-label">DEDUCCIONES</span>
                    <span className="nomina-puntos"></span>
                    <span className="nomina-valor">{formatearPesos(nomina.deducciones)}</span>
                  </div>
                  <div className="nomina-fila nomina-fila-total">
                    <span className="nomina-label">TOTAL DEL PAGO</span>
                    <span className="nomina-puntos"></span>
                    <span className="nomina-valor">{formatearPesos(nomina.total)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="descargar-btn">
          <button className={`btn-descargar nomina-btn-descargar ${seleccionados.length > 0 ? "activo" : ""}`}
            onClick={handleDescargar}>
            DESCARGAR
          </button>
        </div>
      </AppShell>
      <div className="nomina-decor-3"></div>
    </div>
  );
}

export default Nomina;