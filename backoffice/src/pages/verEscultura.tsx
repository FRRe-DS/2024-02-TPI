
import Btn from "../components/btn";
import Menu from "./menu/Menu";
import "./pages.css";

export default function VerEscultura() {

  const escultura = {
    nombre: "El planeta de los pollos",
    descripcion: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
    Quisque blandit sollicitudin sapien, a finibus lectus aliquam ac. 
    Morbi sed eleifend mauris, sed imperdiet nibh. In vulputate quam quam.`,
    autor: {
      nombre: "Stegmayer Tobias",
      nacionalidad: "Argentino",
    },
    fechaFinalizacion: "xx/xx/xxxx",
    imagenes: Array(12).fill(null),
  };

  return (
    <div className="mainContainer">
      <Menu paginaActual={"Esculturas"} />
      <section className="mainSection">
        <header className="header-section">
          <h1 className="header-title">Galería de imágenes</h1>
          <Btn text="Agregar imagen" />
        </header>
        <div className="content">
          <div className="info-panel">
            <h2>{escultura.nombre}</h2>
            <h3>Descripción</h3>
            <p>{escultura.descripcion}</p>
            <h3>Autor</h3>
            <div className="author-info">
              <div className="author-photo">
                <span className="material-symbols-outlined">photo_camera</span>
              </div>
              <div>
                <p>{escultura.autor.nombre}</p>
                <p>{escultura.autor.nacionalidad}</p>
              </div>
            </div>
            <h3>Finalizada</h3>
            <p>{escultura.fechaFinalizacion}</p>
          </div>
          <div className="image-gallery">
            {escultura.imagenes.map((_, index) => (
              <div key={index} className="image-placeholder">
                <span className="material-symbols-outlined">photo_camera</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
