import { Row } from "@tanstack/react-table";
import "./acciones.css";

type Entidad = {
  nombre: string;
  [key: string]: any; // Para aceptar otras propiedades dinámicas
};

interface AccionesProps {
  row: Row<Entidad>;
  tipo: "escultura" | "evento" | "escultor";
  callback: (id: number) => void; // Callback para abrir el popup de edición
}

export default function Acciones({ row, tipo, callback }: AccionesProps) {
  const handleEdit = () => {
    switch (tipo) {
      case "escultura":
        callback(row.original.id); // Llamar al callback para abrir el popup de edición
        break;
      case "evento":
        // Aquí podrías hacer algo similar para eventos, si es necesario
        break;
      case "escultor":
        // Similar para escultores, si es necesario
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
          className="material-symbols-outlined acciones"
        >
          visibility
        </span>
      </a>

      <a href="#">
        <span
          onClick={handleEdit}
          className="material-symbols-outlined acciones"
        >
          edit
        </span>
      </a>
    </div>
  );
}
