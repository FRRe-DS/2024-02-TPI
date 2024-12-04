import { useEffect, useState } from "react";
import "./crearEscultura.css";
import "dayjs/locale/es";
import { useParams } from "react-router-dom";
import { url } from "../utils";

interface NuevaEsculturaPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onNuevoEscultura: () => void
}

interface Escultor {
  id: number;
  nombre_completo: string;
}

export default function NuevaEsculturaPopup({ isOpen, onClose, onNuevoEscultura }: NuevaEsculturaPopupProps) {
    const [eventData, setEventData] = useState({
        nombre: "",
        escultor: "",
        descripcion: "",
    });

  const authToken = localStorage.getItem("token");
  if (!authToken) {
    window.location.href = "/Login";
  }

  const [escultores, setEscultores] = useState<Escultor[]>([]);
  const { id } = useParams();
  const [escultorSeleccionado, setEscultorSeleccionado] = useState<string | null>(null);


  const fetchEscultores = async () => {
    try {
      if (id) {

        const response = await fetch(`${url}/escultores/${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener el escultor");
        }
        const data = await response.json();
        setEscultorSeleccionado(data.nombre_completo); 
      } else {
       
        const response = await fetch(`${url}/escultores/`);
        if (!response.ok) {
          throw new Error("Error al obtener los escultores");
        }
        const data = await response.json();
        setEscultores(data); 
      }
    } catch (error) {
      console.error("Error al cargar escultores:", error);
    }
  };

useEffect(() => {
 
  if (isOpen) {
    fetchEscultores();
  }
}, [id, isOpen]);



    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleSubmit = async () => {
        let escultor_id = ""
        if (id) {
            escultor_id = id
        } else {
            escultor_id = eventData.escultor
        }

        const formData = new FormData();
        formData.append("escultor_id", escultor_id);
        formData.append("nombre", eventData.nombre);
        formData.append("descripcion", eventData.descripcion);

        try {
            const response = await fetch(`${url}/esculturas/`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${authToken}`,
                },
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Escultura creada con éxito:", data);
                onNuevoEscultura();
                onClose();
            } else {
                console.error("Error al crear la escultura:", response.statusText);
            }
        } catch (error) {
            console.error("Error al realizar la solicitud:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="overlay" onClick={onClose}></div>
            <div className="popup">
                <h2>Agregar Escultura</h2>
                <div className="divider"></div>

                <form className="form">
                    <div className="personaldates">
                        <h3>Información de la escultura</h3>
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={eventData.nombre}
                            onChange={handleInputChange}
                            className="focus-input"
                        />
                        {id ? (
                            <input
                                type="text"
                                name="nombre"
                                placeholder="Nombre"
                                value={escultorSeleccionado || ""}
                                readOnly
                                className="focus-input readonly"
                            />
                        ) : (
                            <select
                                name="escultor"
                                value={eventData.escultor}
                                onChange={handleInputChange}
                                className="focus-input"
                            >
                                <option value="">Seleccionar escultor</option>
                                {escultores.map((escultor) => (
                                    <option key={escultor.id} value={escultor.id}>
                                        {escultor.nombre_completo}
                                    </option>
                                ))}
                            </select>
                        )}

                        <textarea
                            name="descripcion"
                            placeholder="Descripción"
                            value={eventData.descripcion}
                            onChange={handleInputChange}
                            className="focus-input texarea-bigger"
                        />
                    </div>

                    <div className="divider"></div>
                    <div className="buttons">
                        <button type="button" className="btn cancelar" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="button" className="btn aceptar" onClick={handleSubmit}>
                            Aceptar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
