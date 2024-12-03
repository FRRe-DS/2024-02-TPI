import { useParams } from "react-router-dom";

export default function EditarEvento() {
    const { id } = useParams();

    return (
        <div>
            <h1>Editar Evento</h1>
            <p>Editando el evento con ID: {id}</p>
        </div>
    );
}
