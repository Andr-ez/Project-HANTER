import { Navigate } from "react-router-dom";

// Decodifica el payload del JWT sin librerías externas.
// Un JWT tiene la forma: header.payload.signature
// El payload está en base64url — lo convertimos a JSON para leer la fecha de expiración.
function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    // payload.exp es la fecha de expiración en segundos Unix.
    // Date.now() devuelve milisegundos, por eso se divide entre 1000.
    return payload.exp < Date.now() / 1000;
  } catch {
    // Si el token tiene un formato inesperado, lo tratamos como expirado.
    return true;
  }
}

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // Sin token → redirige al login.
  if (!token) {
    return <Navigate to="/001" replace />;
  }

  // Token expirado → lo borra del storage y redirige al login.
  if (tokenExpirado(token)) {
    localStorage.removeItem("token");
    return <Navigate to="/001" replace />;
  }

  return children;
};

export default PrivateRoute;