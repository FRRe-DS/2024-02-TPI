import { Link, useNavigate } from "react-router-dom";
import "./menu.css";
import { useEffect, useState } from "react";



export default function Menu({
  paginaActual,
}: {
  paginaActual: "Eventos" | "Escultores" | "Esculturas";
}) {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/Login"); 
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

 
  const isMobile = windowWidth <= 850;

  return (
    <>
     
      <nav className="navigation">
        <div className="logo">
          <img src="../logo.png" alt="Logo bienal del Chaco" />
        </div>
        <div className="navigation__options">
          {!isMobile ? 
          <ul className="navigation__menu"> 
            <li>
              <Link
                to={"/Eventos"}
                className={
                  paginaActual === "Eventos"
                    ? "paginaActual"
                    : "navigation__link"
                }>
                <i className="material-symbols-outlined">&#xebcc;</i>
               
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
                <i className="material-symbols-outlined">&#xf5a3;</i>
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
                <i className="material-symbols-outlined">&#xf7f8;</i>
                <p>Esculturas</p>
              </Link>
            </li>
           
          </ul>
          : <ul className="navigation__menu"> 
          <li>
            <Link
              to={"/Eventos"}
              className={
                paginaActual === "Eventos"
                  ? "paginaActualSm"
                  : "btnSmScreen"
              }>
              <i className="material-symbols-outlined">&#xebcc;</i>
             
              <p>Eventos</p>
            </Link>
          </li>
          <li>
            <Link
              to={"/Escultores"}
              className={
                paginaActual === "Escultores"
                  ? "paginaActualSm"
                  : "btnSmScreen"
              }>
              <i className="material-symbols-outlined">&#xf5a3;</i>
              <p>Escultores</p>
            </Link>
          </li>
          <li>
            <Link
              to={"/Esculturas"}
              className={
                paginaActual === "Esculturas"
                  ? "paginaActualSm"
                  : "btnSmScreen"
              }>
              <i className="material-symbols-outlined">&#xf7f8;</i>
              <p>Esculturas</p>
            </Link>
          </li>
          <li>
            <button className="btnSmScreen" onClick={handleLogout}>
              <i className="material-symbols-outlined">&#xe9ba;</i>
              <p>Salir</p>
            </button>
          </li>         
        </ul>
          }
          <button className="salirBtn navigation__link" onClick={handleLogout}>
            <i className="material-symbols-outlined">&#xe9ba;</i>
            <p>Salir</p>
          </button>
        </div>
      </nav>
    </>
  );
}
