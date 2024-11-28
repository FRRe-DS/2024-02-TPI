import { useParams } from "react-router-dom";

export default function VerEscultor() {
    const { id } = useParams();

    return (
        <div>
            <h1>Detalles del Escultor</h1>
            <p>Mostrando detalles para el escultor con ID: {id}</p>
        </div>
    );
}
