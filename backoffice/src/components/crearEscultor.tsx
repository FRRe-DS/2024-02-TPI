import { useEffect, useState } from "react";
import "./crearEscultor.css";
import "dayjs/locale/es";

interface NuevoEscultorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNuevoEscultor: () => void
}

export default function NuevoEscultorPopup({ isOpen, onClose, onNuevoEscultor }: NuevoEscultorPopupProps) {
  const [eventData, setEventData] = useState({
    nombre: "",
    apellido: "",
    nacionalidad: "",
    correo: "",
    bibliografia:"",

  });
  const [countries, setCountries] = useState<{ id: number; nombre: string }[]>([]);
  const url = "http://localhost:8000/api";


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {    
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = () => {
    onNuevoEscultor();
    onClose();
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${url}/paises/`);
      if (!response.ok) {
        throw new Error("Error al obtener la lista de países");
      }
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      console.error(error);
      setCountries([]);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="popup">
        <h2>Agregar Escultor</h2>
        <div className="divider"></div>
        <form className="form">
          <div className="imgdates">
            <div className="image-container">
            <label htmlFor="img">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="imagenPreview"
                />
              ) : (
                <i className="material-symbols-outlined">&#xe439;</i>
              )}
            </label>
              <input
                type="file"
                id="img"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                className="focus-input"
              />
            </div>
            <div className="personaldates">
              <h3>Datos personales</h3>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={eventData.nombre}
                onChange={handleInputChange}
                className="focus-input"
              />
              <input
                type="text"
                name="nombre"
                placeholder="Apellido"
                value={eventData.apellido}
                onChange={handleInputChange}
                className="focus-input"
              />
               <div>
               
                <select
                  name="nacionalidad"
                  id="nacionalidad"
                  value={eventData.nacionalidad}
                  onChange={handleInputChange}
                  className="focus-input"
                >
                  <option value="" disabled>
                    Seleccione una nacionalidad
                  </option>
                  {countries.map((pais) => (
                    <option key={pais.id} value={pais.id}>
                      {pais.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                name="correo"
                placeholder="Correo"
                value={eventData.correo}
                onChange={handleInputChange}
                className="focus-input"
              />
            </div>
          </div>
          <h3>Biografia</h3>
          <textarea
            name="bibliografia"
            placeholder="Bibliografia"
            value={eventData.bibliografia}
            onChange={handleInputChange}
            className="focus-input"
          />
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

