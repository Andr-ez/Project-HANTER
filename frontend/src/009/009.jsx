// ==============================
// IMPORTACIONES
// ==============================

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './009.css';


// ============================================================
// NÚMERO DE WHATSAPP — modificar aquí si cambia
// ============================================================

const NUMERO_WA = '57 1234567890';


// ============================================================
// COMPONENTE CONTACTO WHATSAPP
// ============================================================

function ContactoWhatsApp() {

  // Cambia el título de la pestaña al cargar el componente
  useEffect(() => {
    document.title = "Soporte — WhatsApp";
  }, []);

  // ============================================================
  // Abre WhatsApp con el número definido
  // ============================================================
  const abrirWhatsApp = () => {
    window.open(`https://wa.me/${NUMERO_WA}`, '_blank');
  };


  // ============================================================
  // ESTRUCTURA VISUAL (JSX)
  // ============================================================
  return (
    <div className="contacto-page">
      <div className="circuloFondo">

        {/* Botón regresar */}
        <Link to="/007" className="back-btn">
          ←
        </Link>

        {/* Título principal */}
        <div className="title">
          <h1>SOPORTE<br />TÉCNICO</h1>
        </div>

        {/* Texto de redirección */}
        <p className="contacto-redirigiendo">
          ESTAS SIENDO REDIRIGIDO A<br />EL CHAT DE WHATSAPP
        </p>

        {/* Botón principal WhatsApp */}
        <button className="btn-whatsapp" onClick={abrirWhatsApp}>
          CLICK PARA IR AL<br />CHAT DE WHATSAPP
        </button>

        {/* Texto alternativo con número */}
        <p className="contacto-alternativo">
          POR SI EL METODO ANTERIOR<br />
          FUNCIONO PUEDE ESCRIBIR<br />
          AL CHAT DE WHATSAPP<br />
          <span className="contacto-numero">+57 1234567890</span>
        </p>

        {/* Elementos decorativos */}
        <div className="cGDecor-1"></div>
        <div className="cGDecor-2"></div>
        <div className="cGDecor-3"></div>
        <div className="cGDecor-4"></div>

      </div>
    </div>
  );
}

// Exportación del componente para poder usarlo en main.jsx
export default ContactoWhatsApp;
