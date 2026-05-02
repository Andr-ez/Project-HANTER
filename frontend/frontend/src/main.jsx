//IMPORTACIONES DE REACT 
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';



// Importación de componentes
import Bienvenido from './000/000.jsx';
import Login from './001/001.jsx';
import Registro from './004/004.jsx';
import RecuperarContrasena from './002/002.jsx';
import Inicio from './100/100.jsx';
import ProcesoPage from './pagina-proceso/proceso-page.jsx';
import Certificados from './101/101.jsx';
import AnadirCertificado from './102/102.jsx';
import BuscarCertificado from './103/103.jsx';
import AdminCertificados from './103/103-A.jsx';
import Nomina from './104/104.jsx';



import './styles.css'; // Estilos globales de la aplicación





// Renderizado de la aplicación con rutas definidas Y LINKs
createRoot(document.getElementById('root')).render( 
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Bienvenido />} />
    <Route path="/001" element={<Login />} />
    <Route path="/002" element={<RecuperarContrasena />} />
    <Route path="/004" element={<Registro />} />
    <Route path="/100" element={<Inicio />} />
    <Route path="/101" element={<Certificados />} />
    <Route path="/102" element={<AnadirCertificado />} />
    <Route path="/103" element={<BuscarCertificado />} />
    <Route path="/103-A" element={<AdminCertificados />} />
    <Route path="/proceso" element={<ProcesoPage />} />
    <Route path="/104" element={<Nomina />} />

  </Routes>
</BrowserRouter>
);
