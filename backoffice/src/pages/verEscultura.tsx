import { useParams } from "react-router-dom";

export default function VerEscultura() {
  const { id } = useParams();

  return (
    <div>
      <h1>Detalles de la Escultura</h1>
      <p>Mostrando detalles para la escultura con ID: {id}</p>
    </div>
  );
}
