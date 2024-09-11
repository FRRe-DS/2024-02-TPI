import { Link } from 'react-router-dom';
import './menu.css';

export default function Menu() {
  return (
    <nav className="navigation">
      <div>
        <img src="" alt="Logo bienal del Chaco" />
      </div>
      <ul className="navigation__menu">
        <li>
          <Link to={'/Eventos'} className="navigation__link">
            <span className="material-symbols-outlined">calendar_month</span>
            <p>Eventos</p>
          </Link>
        </li>
        <li>
          <Link to={'/Escultores'} className="navigation__link">
            <span className="material-symbols-outlined">person_apron</span>
            <p>Escultores</p>
          </Link>
        </li>
        <li>
          <Link to={'/Esculturas'} className="navigation__link">
            <span className="material-symbols-outlined">draw_abstract</span>
            <p>Esculturas</p>
          </Link>
        </li>
      </ul>
      <div className="navigation__link">
        <span className="material-symbols-outlined">logout</span>
        <p>Salir</p>
      </div>
    </nav>
  );
}
