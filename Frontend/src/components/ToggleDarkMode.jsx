import { useState, useEffect } from "react";
import luna from "/fotos/icon/luna-icon.png";
import sol from "/fotos/icon/sol-icon.png";

export default function ToggleDarkMode() {

  const [oscuro, setOscuro] = useState(() => {
    return localStorage.getItem("tema") === "dark";
  });

  useEffect(() => {
    if (oscuro) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("tema", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("tema", "light");
    }
  }, [oscuro]);

  return (
    <button
      onClick={() => setOscuro(!oscuro)}
      title={oscuro ? "Modo claro" : "Modo oscuro"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "50px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "transform 0.2s ease"
      }}
    >
      <img
        src={oscuro ? sol : luna}
        alt={oscuro ? "Sol" : "Luna"}
        style={{ width: "28px", height: "28px", objectFit: "contain" }}
      />
      <span style={{ fontSize: "11px", letterSpacing: "1px" }}>
        {oscuro ? "MODO CLARO" : "MODO OSCURO"}
      </span>
    </button>
  );
}