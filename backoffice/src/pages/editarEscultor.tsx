import { useParams } from "react-router-dom";

export default function EditarEscultor() {
    const { id } = useParams();

    return (
        <div>
            <h1>Editar Escultor</h1>
            <p>Editando el escultor con ID: {id}</p>
        </div>
    );
}
