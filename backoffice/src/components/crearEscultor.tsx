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
  const authToken = localStorage.getItem("token");
  if (!authToken) {
    throw new Error("Token no encontrado. Inicia sesión nuevamente.");
  }


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];  
    const fileContainer = document.querySelector(".custom-file-upload")
    if (file) {
      fileContainer?.classList.add("activeFile")
      setFileName(file.name); 
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    
    // Agregar datos del formulario
    formData.append("nombre", eventData.nombre);
    formData.append("apellido", eventData.apellido);
    formData.append("pais_id", eventData.nacionalidad);
    formData.append("correo", eventData.correo);
    formData.append("bibliografia", eventData.bibliografia);
    
    // Agregar archivo si existe
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append("foto", fileInput.files[0]);
    }
  
    try {
      const response = await fetch(`${url}/escultores/`, {
        method: "POST",
        headers: {       
          Authorization: `Token ${authToken}`, 
          
        },
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Error al guardar el escultor");
      }
  
      onNuevoEscultor();
      onClose();
    } catch (error) {
      console.error("Error al guardar el escultor:", error);
    }
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
         
         
            <div className="personaldates">
              <h3>Información personales</h3>
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
                name="apellido"
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
         

          <textarea
            name="bibliografia"
            placeholder="Bibliografia"
            value={eventData.bibliografia}
            onChange={handleInputChange}
            className="focus-input"
          />
           <div className="custom-file-upload active">
              <label htmlFor="file-upload" >
                {fileName ? <p>Archivo seleccionado: {fileName}</p> : <p>Seleccionar archivo {fileName}</p>}

              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                style={{ display: "none" }}
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

