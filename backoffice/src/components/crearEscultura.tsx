import { useState } from "react";
import "./crearEscultura.css";
import "dayjs/locale/es";
import Search from "../components/search";

interface NuevaEsculturaPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NuevaEsculturaPopup({ isOpen, onClose }: NuevaEsculturaPopupProps) {
  const [eventData, setEventData] = useState({
    imagen: "",
    nombre: "",
    escultor: "",
    nacionalidad: "",
    descripcion: "",
  });

  const [globalFilter, setGlobalFilter] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Datos del evento:");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="popup">
        <h3>Agregar Escultura</h3>
        <form className="form">
          <input
            type="text"
            name="imagen"
            placeholder="Imagen"
            value={eventData.imagen}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={eventData.nombre}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="escultor"
            placeholder="Escultor"
            value={eventData.escultor}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="nacionalidad"
            placeholder="Nacionalidad"
            value={eventData.nacionalidad}
            onChange={handleInputChange}
          />
          <textarea
            name="descripcion"
            placeholder="Descripción de la escultura"
            value={eventData.descripcion}
            onChange={handleInputChange}
          />
          <h3>Asignar escultor</h3>
          <Search
            text="Buscar por escultor o Nacionalidad"
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
          />
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
