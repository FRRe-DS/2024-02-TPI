import React from "react";
import Btn from "../components/btn";
import Menu from "./menu/Menu";
import "./pages.css";

type Escultura = {
  id: number;
  nombre: string;
  fecha: string;
  descripcion: string;
};

export default function VerEscultor() {
  const escultor = {
    nombre: "Stegmayer Tobias",
    nacionalidad: "Argentino",
    biografia: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      Quisque blandit sollicitudin sapien, a finibus lectus aliquam ac. 
      Integer non purus ligula. Curabitur orci nunc, consectetur vel pellentesque vitae, blandit vitae arcu.`,
  };

  const obras: Escultura[] = [
    {
      id: 1,
      nombre: "El planeta de los pollos",
      fecha: "30/08/2024",
      descripcion: "Lorem ipsum dolor sit amet, consectetur...",
    },
    {
      id: 2,
      nombre: "Sinergia",
      fecha: "30/08/2024",
      descripcion: "Lorem ipsum dolor sit amet, consectetur...",
    },
  ];

  const handleVerMas = (id: number) => {
    alert(`Ver más sobre la escultura con ID: ${id}`);
  };

  const handleEditar = (id: number) => {
    alert(`Editar la escultura con ID: ${id}`);
  };

  return (
    <div className="mainContainer">
      <Menu paginaActual={"Escultores"} />
      <section className="mainSection">
        <header className="header-section">
          <h1 className="header-title">Perfil del escultor</h1>
          <Btn text="Agregar escultura" />
        </header>
        <div className="profile-section">
          <div className="profile-info">
            <h2>{escultor.nombre}</h2>
            <p>{escultor.nacionalidad}</p>
            <h3>Bibliografía</h3>
            <p>{escultor.biografia}</p>
          </div>
          <div className="profile-image">
            {/* Placeholder para imagen del escultor */}
            <span className="material-symbols-outlined">photo_camera</span>
          </div>
        </div>
        <div className="section-container">
          <h2>Obras realizadas</h2>
          <div className="table-container">
            <table className="event-table">
              <thead>
                <tr>
                  <th>Escultura</th>
                  <th>Nombre</th>
                  <th>Finalizada</th>
                  <th>Descripción</th>
                  <th>Ver más</th>
                  <th>Editar</th>
                </tr>
              </thead>
              <tbody>
                {obras.map((obra) => (
                  <tr key={obra.id}>
                    <td>
                      <span className="material-symbols-outlined">photo_camera</span>
                    </td>
                    <td>{obra.nombre}</td>
                    <td>{obra.fecha}</td>
                    <td>{obra.descripcion}</td>
                    <td>
                      <button
                        className="icon-button"
                        onClick={() => handleVerMas(obra.id)}
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        onClick={() => handleEditar(obra.id)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <footer className="pagination">
              <a href="#" className="page-link">
                <span className="material-symbols-outlined">
                  keyboard_double_arrow_left
                </span>
              </a>
              <a href="#" className="page-link">
                <span className="material-symbols-outlined">keyboard_arrow_left</span>
              </a>
              <a href="#" className="page-link">
                <span className="material-symbols-outlined">keyboard_arrow_right</span>
              </a>
              <a href="#" className="page-link">
                <span className="material-symbols-outlined">
                  keyboard_double_arrow_right
                </span>
              </a>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}
