import { useState } from "react";
import "./agregarImagen.css";
import "dayjs/locale/es";
import DateFilter from "../components/dateFilterSimple";

interface AgregarImagenPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgregarImagenPopup({ isOpen, onClose }: AgregarImagenPopupProps) {
  const [eventData, setEventData] = useState({
    fecha_publicacion: "",
    descripcion:"",
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
        <h1>Editar Imagen</h1>
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
              <h3>Fecha de Publicacion</h3>
              <div className="fechas">
                <DateFilter text="XX/XX/XX"/>
              </div>
              <h3>Biografia</h3>
              <textarea
                name="Descripcion"
                placeholder="Descripcion"
                value={eventData.descripcion}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="buttons">
            <button type="button" className="btn cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn aceptar" onClick={handleSubmit}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

