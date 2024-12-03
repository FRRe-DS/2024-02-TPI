import { useParams } from "react-router-dom";

export default function EditarEscultura() {
    const { id } = useParams();

    return (
        <div>
            <h1>Editar Escultura</h1>
            <p>Editando la escultura con ID: {id}</p>
        </div>
    );
}