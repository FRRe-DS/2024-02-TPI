import { Row } from "@tanstack/react-table";
import "./acciones.css";

type Evento = {
  nombre: string;
  lugar: string;
  tematica: string;
  inicio: string;
  fin: string;
  descripcion: string;
};

export default function Acciones({ row }: { row: Row<Evento> }) {
  const handleEdit = () => {
    alert(`Editando fila: ${row.original.nombre}`);
  };

  const handleVermas = () => {
    alert(`Ver más: ${row.original.nombre}`);
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
