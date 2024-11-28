import { Row } from "@tanstack/react-table";
import "./acciones.css";

type Entidad = {
  nombre: string;
  [key: string]: any; // Para aceptar otras propiedades dinámicas
};

interface AccionesProps {
  row: Row<Entidad>;
  tipo: "escultura" | "evento" | "escultor";
}

export default function Acciones({ row, tipo }: AccionesProps) {
  const handleEdit = () => {
    switch (tipo) {
      case "escultura":
        window.location.href = `/editar-escultura/${row.original.id}`;
        break;
      case "evento":
        window.location.href = `/editar-evento/${row.original.id}`;
        break;
      case "escultor":
        window.location.href = `/editar-escultor/${row.original.id}`;
        break;
      default:
        alert("Acción no definida");
    }
  };

  const handleVermas = () => {
    switch (tipo) {
      case "escultura":
        window.location.href = `/ver-escultura/${row.original.id}`;
        break;
      case "evento":
        window.location.href = `/ver-evento/${row.original.id}`;
        break;
      case "escultor":
        window.location.href = `/ver-escultor/${row.original.id}`;
        break;
      default:
        alert("Acción no definida");
    }
  };

  return (
    <div className="acciones_container">
      <a href="#">
        <span
          onClick={handleVermas}
          className="material-symbols-outlined acciones">
          visibility
        </span>
      </a>

      <a href="#">
        <span
          onClick={handleEdit}
          className="material-symbols-outlined acciones">
          edit
        </span>
      </a>
    </div>
  );
}
