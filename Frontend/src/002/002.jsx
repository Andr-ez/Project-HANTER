// ==============================
// IMPORTACIONES
// ==============================

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./002.css";

// Íconos
import emailIcon from "/fotos/icon/email-icon.png";

// ============================================================
// COMPONENTE RECUPERAR CONTRASEÑA
// ============================================================

function RecuperarContrasena() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");

  useEffect(() => {
    document.title = "RECUPERAR CONTRASEÑA";
  }, []);

  // ============================================================
  // Manejador de Input Único (Validación)
  // ============================================================
  const handleChangeCodigo = (e) => {
    const valor = e.target.value;
    if (/^\d{0,6}$/.test(valor)) {
      setCodigo(valor);
    }
  };

  // ============================================================
  // ESTRUCTURA VISUAL (JSX)
  // ============================================================
  return (
    <div className="recuperar-page">
      <div className="circuloFondo">

        {/* Botón regresar */}
        <Link to="/001" className="back-btn" aria-label="Regresar">
          ←
        </Link>

        {/* Título */}
        <div className="title">
          <h2>RECUPERAR CONTRASEÑA</h2>
        </div>

        {/* Contenedor principal de recuperación */}
        <div className="recuperar-container">

          {/* PRIMERA PARTE: Solicitar Código */}
          <div className="seccion-formulario">
            <label className="info-text">
              INGRESA TU CORREO PARA RECUPERAR TU CONTRASEÑA
            </label>

            <div className="input-group">
              <img src={emailIcon} alt="Correo" className="email" />
              <input
                type="email"
                placeholder="CORREO@ELECTRONICO.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className="btn-action" onClick={() => navigate("/proceso")}>
              ENVIAR CÓDIGO
            </button>
          </div>

          {/* SEGUNDA PARTE: Verificar Código */}
          <div className="seccion-formulario segunda-fase">
            <label className="info-text">
              INGRESA EL CÓDIGO DE VERIFICACIÓN
            </label>

            <div className="input-group codigo-unico">
              <input
                type="text"
                inputMode="numeric"
                placeholder="- - - - - -"
                value={codigo}
                onChange={handleChangeCodigo}
                autoComplete="off"
              />
            </div>

            <button className="btn-action" onClick={() => navigate("/proceso")}>
              VERIFICAR CÓDIGO
            </button>
          </div>

        </div>

        {/* Elementos decorativos */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>
        <div className="cADecor-1"></div>

      </div>
    </div>
  );
}

export default RecuperarContrasena;