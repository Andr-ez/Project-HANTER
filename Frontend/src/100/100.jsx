import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSesion } from "../components/useSesion";
import AppShell from "../components/AppShell";
import "./100.css";

function Inicio() {
  const navigate  = useNavigate();
  const { usuario, botones, cargando } = useSesion();

  useEffect(() => { document.title = "INICIO"; }, []);

  return (
    <div className="inicio-page">
      <AppShell
        title="INICIO"
        usuario={usuario}
        botones={botones}
        cargando={cargando}
        linkActivo="/100"
      >
        <section className="info-section">
          <h2 className="section-title">¿QUÉ ES HANTER?</h2>
          <p className="section-text">
            Es una aplicación web diseñada como un sistema de gestión integral de empleados
            y generación de certificados. Su propósito principal es permitir que las empresas
            mantengan una base de datos sólida y ordenada de sus colaboradores para agilizar
            procesos administrativos, como la creación de distintos tipos de certificados laborales.
          </p>
        </section>

        <section className="info-section">
          <h2 className="section-title">¿QUIÉN LO DESARROLLA?</h2>
          <p className="section-text">
            El proyecto es desarrollado por un equipo de aprendices del SENA (Servicio Nacional de
            Aprendizaje) dentro del programa de Análisis y Desarrollo de Software.
          </p>
          <ul className="team-list">
            <li>Jorge Andrés Velásquez Villar</li>
            <li>Jaime Antonio Marín Barrientos</li>
            <li>Rosa Elizabeth Castillo Vásquez</li>
          </ul>
        </section>

        <section className="info-section">
          <h2 className="section-title">¿QUÉ SOLUCIONES OFRECE?</h2>
          <p className="section-text">
            La plataforma busca resolver problemas de desorganización administrativa mediante las
            siguientes funcionalidades:
          </p>
          <ul className="solutions-list">
            <li><span className="list-label">Gestión de Certificados:</span> Permite guardar y descargar certificados para cada empleado de forma rápida.</li>
            <li><span className="list-label">Administración de Personal:</span> Registro y control de datos personales y laborales.</li>
            <li><span className="list-label">Panel Administrativo (RRHH):</span> Herramientas exclusivas para que el personal de Recursos Humanos gestione empleados, asigne roles y genere reportes.</li>
            <li><span className="list-label">Gestión de Capacitaciones:</span> Seguimiento de cursos realizados y certificados de estudio obtenidos por el personal.</li>
            <li><span className="list-label">Seguridad y Soporte:</span> Incluye módulos para recuperación de contraseñas, edición de perfil y contacto con soporte técnico.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2 className="section-title">TECNOLOGÍAS DEL SISTEMA</h2>
          <ul className="solutions-list">
            <li><span className="list-label">Lenguajes de Programación:</span> JavaScript con Node.js y Express, Java con Spring Boot, HTML, React.js y CSS.</li>
            <li><span className="list-label">Base de Datos:</span> SQLite, gestionada mediante el ORM Prisma.</li>
            <li><span className="list-label">Estándares de Calidad:</span> El diseño contempla normativas como la ISO 25010 y el GDPR.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2 className="section-title">OTROS ASPECTOS IMPORTANTES</h2>
          <ul className="solutions-list">
            <li><span className="list-label">Metodología Ágil:</span> El proyecto se desarrolla bajo marcos de trabajo ágiles (Scrum).</li>
            <li><span className="list-label">Diseño de Experiencia (UX/UI):</span> Se utilizó Figma como herramienta principal de prototipado.</li>
            <li><span className="list-label">Estándares de Código:</span> El equipo sigue reglas estrictas de codificación para garantizar que el software sea profesional y escalable.</li>
          </ul>
        </section>
      </AppShell>
    </div>
  );
}

export default Inicio;