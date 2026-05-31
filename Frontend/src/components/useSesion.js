// ============================================================
// useSesion — hook que carga los datos de sesión del usuario
// autenticado (nombre, foto, rol) y los botones de navegación
// desde GET /auth/sesion.
//
// Uso:
//   const { usuario, botones, cargando } = useSesion();
//
// Si el token no existe o la respuesta no es OK, redirige a /001.
// ============================================================
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useSesion() {
  const navigate = useNavigate();

  const [usuario,  setUsuario]  = useState({ nombre: "", foto: null, rol: "" });
  const [botones,  setBotones]  = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/001"); return; }

      try {
        const res = await fetch("http://localhost:3000/auth/sesion", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) { navigate("/001"); return; }

        const data = await res.json();
        setUsuario({
          nombre: data.usuario.nombre,
          foto:   data.usuario.foto || null,
          rol:    data.usuario.rol,
        });
        setBotones(data.botones);
      } catch (err) {
        console.error("Error al cargar sesión:", err);
        navigate("/001");
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [navigate]);

  return { usuario, botones, cargando };
}