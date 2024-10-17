import { Link } from "react-router-dom";
import "./menu.css";

export default function Menu({
  paginaActual,
}: {
  paginaActual: "Eventos" | "Escultores" | "Esculturas";
}) {
  return (
    <>
      <span className="material-symbols-outlined navigation__btn">menu</span>
      <nav className="navigation">
        <div className="logo">
          <img src="../logo.png" alt="Logo bienal del Chaco" />
        </div>
        <div className="navigation__options">
          <ul className="navigation__menu">
            <li>
              <Link
                to={"/Eventos"}
                className={
                  paginaActual === "Eventos"
                    ? "paginaActual"
                    : "navigation__link"
                }>
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
                <p>Eventos</p>
              </Link>
            </li>
            <li>
              <Link
                to={"/Escultores"}
                className={
                  paginaActual === "Escultores"
                    ? "paginaActual"
                    : "navigation__link"
                }>
                <span className="material-symbols-outlined">person_apron</span>
                <p>Escultores</p>
              </Link>
            </li>
            <li>
              <Link
                to={"/Esculturas"}
                className={
                  paginaActual === "Esculturas"
                    ? "paginaActual"
                    : "navigation__link"
                }>
                <span className="material-symbols-outlined">draw_abstract</span>
                <p>Esculturas</p>
              </Link>
            </li>
          </ul>
          <div className="salirBtn">
            <span className="material-symbols-outlined">logout</span>
            <p>Salir</p>
          </div>
        </div>
      </nav>
    </>
  );
}
