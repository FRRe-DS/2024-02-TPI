import { useParams } from "react-router-dom";

export default function VerEvento() {
    const { id } = useParams();

    return (
        <div>
            <h1>Detalles del Evento</h1>
            <p>Mostrando detalles para el evento con ID: {id}</p>
        </div>
    );
}
