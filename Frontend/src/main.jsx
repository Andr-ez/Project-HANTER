//IMPORTACIONES DE REACT 
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';



// Importación de componentes
import Bienvenido from './000/000.jsx';
import Login from './001/001.jsx';
import RecuperarContrasena from './002/002.jsx';
import Inicio from './100/100.jsx';
import Registro from './004/004.jsx';



// Renderizado de la aplicación con rutas definidas Y LINKs
createRoot(document.getElementById('root')).render( 
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Bienvenido />} />
    <Route path="/001" element={<Login />} />
    <Route path="/004" element={<Registro />} />
    <Route path="/002" element={<RecuperarContrasena />} />
    <Route path="/100" element={<Inicio />} />
  </Routes>
</BrowserRouter>
);
