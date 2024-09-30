import Btn from "../components/btn";
import Filter from "../components/filter";
import Search from "../components/search";
import Menu from "./menu/Menu";
import "./pages.css";

export default function Eventos() {
  return (
    <div className="mainContainer">
      <Menu paginaActual={"Eventos"} />
      <section className="mainSection">
        <header className="header-section">
          <h1 className="header-title">Eventos</h1>
          <Btn text="Nuevo evento" />
        </header>
        <div className="section-container">
          <div className="action-btn__container">
            <Search text="Buscar por escultor o nacionalidad" />
            <Filter text="Fecha" />
          </div>
          <div className="table-container">
            <table className="event-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Lugar</th>
                  <th>Tematica</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Descripción</th>
                  <th>Ver más</th>
                  <th>Editar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bienal 2025</td>
                  <td>Domo del centenario</td>
                  <td>Madera</td>
                  <td>30/07/2024</td>
                  <td>30/08/2024</td>
                  <td>Lorem ipsum dolor sit amet, consectetur...</td>
                  <td>
                    <a href="#">
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </a>
                  </td>
                  <td>
                    <a href="#">
                      <span className="material-symbols-outlined">edit</span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Bienal 2025</td>
                  <td>Domo del centenario</td>
                  <td>Madera</td>
                  <td>30/07/2024</td>
                  <td>30/08/2024</td>
                  <td>Lorem ipsum dolor sit amet, consectetur...</td>
                  <td>
                    <a href="#">
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                    </a>
                  </td>
                  <td>
                    <a href="#">
                      <span className="material-symbols-outlined">edit</span>
                    </a>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={8} className="pagination">
                    <a href="#" className="page-link">
                      <span className="material-symbols-outlined">
                        keyboard_double_arrow_left
                      </span>
                    </a>
                    <a href="#" className="page-link">
                      <span className="material-symbols-outlined">
                        keyboard_arrow_left
                      </span>
                    </a>
                    <a href="#" className="page-link">
                      <span className="material-symbols-outlined">
                        keyboard_arrow_right
                      </span>
                    </a>
                    <a href="#" className="page-link">
                      <span className="material-symbols-outlined">
                        keyboard_double_arrow_right
                      </span>
                    </a>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
