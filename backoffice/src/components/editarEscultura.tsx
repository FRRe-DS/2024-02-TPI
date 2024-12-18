import { useEffect, useState } from "react";
import "./crearEscultura.css";
import { url } from "../utils";

interface EditarEsculturaPopupProps {
    isOpen: boolean;
    onClose: () => void;
    esculturaId: number | null;
    onUpdate: () => void;  // Callback para actualizar la tabla del componente padre
}

type Escultura = {
    id: number;
    nombre: string;
    escultor: string;
    nacionalidad: string;
    descripcion: string;
};

export default function EditarEsculturaPopup({
    isOpen,
    onClose,
    esculturaId,
    onUpdate,
}: EditarEsculturaPopupProps) {

  const authToken = localStorage.getItem("token");
  if (!authToken) {
    window.location.href = "/Login";
  }


    const [escultura, setEscultura] = useState<Escultura | null>(null);
    const [nombre, setNombre] = useState<string>("");
    const [descripcion, setDescripcion] = useState<string>("");

    useEffect(() => {
        if (esculturaId !== null) {
            fetch(`${url}/esculturas/${esculturaId}/`)
                .then((response) => response.json())
                .then((data) => {
                    setEscultura(data);
                    setNombre(data.nombre);
                    setDescripcion(data.descripcion);
                })
                .catch((error) => console.error("Error al obtener la escultura:", error));
        }
    }, [esculturaId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (escultura) {
            const updatedEscultura = {
                ...escultura,
                nombre,
                descripcion,
            };


            fetch(`${url}/esculturas/${esculturaId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${authToken}`,
                },
                body: JSON.stringify(updatedEscultura),
            })
                .then((response) => response.json())
                .then(() => {
                    onUpdate();
                    onClose();
                })
                .catch((error) => console.error("Error al actualizar la escultura:", error));
        }
    };

    if (!isOpen || escultura === null) return null;

    return (
        <>
            <div className="overlay" onClick={onClose}></div>
            <div className="popup">
                <h2>Editar Escultura</h2>
                <div className="divider"></div>
                <form onSubmit={handleSubmit} className="form">

                    <input
                        type="text"
                        value={nombre}
                        placeholder="Nombre"
                        onChange={(e) => setNombre(e.target.value)}
                        className="focus-input"
                    />

                    <textarea
                        value={descripcion}
                        placeholder="Descripción"
                        onChange={(e) => setDescripcion(e.target.value)}
                        className="focus-input texarea-bigger"
                    />
                    <div className="divider"></div>
                    <div className="buttons">
                        <button type="button" onClick={onClose} className="btn cancelar">Cerrar</button>
                        <button type="submit" className="btn aceptar">Actualizar</button>

                    </div>

                </form>
            </div>
        </>
    );
}

