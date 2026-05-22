//IMPORTACIONES DE REACT 
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';



// Importación de componentes
import Bienvenido from './000/000.jsx';
import Login from './001/001.jsx';
import RecuperarContrasena from './002/002.jsx';
import Registro from './004/004.jsx';
import SoporteTecnico from './007/007.jsx';
import CalificarSistema from './008/008.jsx';
import CalificarGuardada from './008-z/008-z.jsx';
import ContactoWhatsApp from './009/009.jsx';
import DudasInquietudes from './010/010.jsx';
import VideoSolucion from './011/011.jsx';
import Inicio from './100/100.jsx';
import ProcesoPage from './pagina-proceso/proceso-page.jsx';
import Certificados from './101/101.jsx';
import CertificadosAdmin from './101/101-A.jsx';
import AnadirCertificado from './101/102/102.jsx';
import BuscarCertificado from './101/103/103.jsx';
import SolicitudCertificadosAdmin from './101/103/103-A.jsx';
import Nomina from './104/104.jsx';
<<<<<<< HEAD
import EnviarNominaAdmin from './118-A/118-A.jsx';
=======
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
import Capacitaciones from './125/125.jsx';
import CursosDisponibles from './126/126.jsx';
import AdminInscripciones from './126-A/126-A.jsx';
import HistorialCursos from './133/133.jsx';
import Notificaciones from './500/500.jsx';
import Perfil from './perfil/perfil.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';


import './styles.css'; // Estilos globales de la aplicación



const temaGuardado = localStorage.getItem("tema");
if (temaGuardado === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
}



// Renderizado de la aplicación con rutas definidas Y LINKs
createRoot(document.getElementById('root')).render( 
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Bienvenido />} />
    <Route path="/001" element={<Login />} />
    <Route path="/002" element={<RecuperarContrasena />} />
    <Route path="/004" element={<Registro />} />
    <Route path="/007" element={<SoporteTecnico />} />
    <Route path="/008" element={<CalificarSistema />} />
    <Route path="/008-z" element={<CalificarGuardada />} />
    <Route path="/009" element={<ContactoWhatsApp />} />
    <Route path="/010" element={<DudasInquietudes />} />
    <Route path="/011" element={<VideoSolucion />} />
    <Route path="/100" element={<PrivateRoute><Inicio /></PrivateRoute>} />
    <Route path="/101" element={<PrivateRoute><Certificados /></PrivateRoute>} />
    <Route path="/101-A" element={<PrivateRoute><CertificadosAdmin /></PrivateRoute>} />
    <Route path="/102" element={<PrivateRoute><AnadirCertificado /></PrivateRoute>} />
    <Route path="/103" element={<PrivateRoute><BuscarCertificado /></PrivateRoute>} />
    <Route path="/103-A" element={<PrivateRoute><SolicitudCertificadosAdmin /></PrivateRoute>} />
    <Route path="/proceso" element={<ProcesoPage />} />
    <Route path="/104" element={<PrivateRoute><Nomina /></PrivateRoute>} />
<<<<<<< HEAD
    <Route path="/118-A" element={<PrivateRoute><EnviarNominaAdmin /></PrivateRoute>} />
=======
>>>>>>> 1241af5cbdd6a74e2b2b16db50396414a031a06f
    <Route path="/125" element={<PrivateRoute><Capacitaciones /></PrivateRoute>} />
    <Route path="/126" element={<PrivateRoute><CursosDisponibles /></PrivateRoute>} />
    <Route path="/126-A" element={<PrivateRoute><AdminInscripciones /></PrivateRoute>} />
    <Route path="/133" element={<PrivateRoute><HistorialCursos /></PrivateRoute>} />
    <Route path="/500" element={<PrivateRoute><Notificaciones /></PrivateRoute>} />
    <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
  </Routes>
</BrowserRouter>
);
