import React, { useState } from "react";
import "./pages.css";

export default function LoginAdmin() {
  const [credentials, setCredentials] = useState({ usr: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando sesión con:", credentials);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="logo">
          <img src="../logo.png" alt="Logo bienal del Chaco" />
        </div>
        <h2>Admin Login</h2>
        <input
          type="text"
          name="usuario"
          placeholder="Usuario"
          value={credentials.usr}
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
      </form>
    </div>
  );
}
