import { useState } from "react";
import "./crearEscultor.css";
import "dayjs/locale/es";

interface NuevoEscultorPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NuevoEscultorPopup({ isOpen, onClose }: NuevoEscultorPopupProps) {
  const [eventData, setEventData] = useState({
    nombre: "",
    nacionalidad: "",
    correo: "",
    bibliografia:"",

  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const [selectedImage, setSelectedImage] = useState("../Camera.png");//

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {//
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleSubmit = () => {
    console.log("Datos del evento");
    onClose(); // Cierra el popup al enviar
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="popup">
        <h1>Agregar Escultor</h1>
        <form className="form">
          <div className="imgdates">
            <div className="image-container">
              <label htmlFor="img">
                <img src={selectedImage} alt="Imagen seleccionada" />
              </label>
              <input
                type="file"
                id="img"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
            <div className="personaldates">
              <h3>Datos personales</h3>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre y Apellido"
                value={eventData.nombre}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="nacionalidad"
                placeholder="Nacionalidad"
                value={eventData.nacionalidad}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="correo"
                placeholder="Correo"
                value={eventData.correo}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <h4>Biografia</h4>
          <textarea
            name="bibliografia"
            placeholder="Bibliografia"
            value={eventData.bibliografia}
            onChange={handleInputChange}
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

