import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pages.css";

export default function LoginAdmin() {
  const [credentials, setCredentials] = useState({ usuario: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const url = "http://localhost:8000/api";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${url}/get_token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: credentials.usuario,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Error al iniciar sesión");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token); 
      navigate("/eventos"); 
    } catch (error) {
      setError("Error al conectar con el servidor. Intente nuevamente.");
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo">
          <img src="../logo.png" alt="Logo bienal del Chaco" />
        </div>
        <h2>Administrador</h2>
        <input
          type="text"
          name="usuario"
          placeholder="Usuario"
          value={credentials.usuario}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={credentials.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="login-btn">
          Iniciar Sesión
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}
