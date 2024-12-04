import { useEffect, useState } from "react";
import "./crearEscultor.css";
import "dayjs/locale/es";

interface NuevoEscultorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNuevoEscultor: () => void;
  eventoId: number
}

interface Escultor {
  id: number;
  nombre_completo: string;
}

export default function AgregarEscultorAevento({ isOpen, onClose, onNuevoEscultor, eventoId }: NuevoEscultorPopupProps) {
  const [eventData, setEventData] = useState({
    nombre: "",
    apellido: "",
    nacionalidad: "",
    escultor: "",
    correo: "",
    bibliografia:"",

  });
  const [countries, setCountries] = useState<{ id: number; nombre: string }[]>([]);
  const url = "http://localhost:8000/api";
  const [nuevoEscultor, setNuevoEscultor] = useState(false);
  const [escultores, setEscultores] = useState<Escultor[]>([]);

  const authToken = localStorage.getItem("token");
  if (!authToken) {
    window.location.href = "/Login";
  }


  const fetchEscultores = async () => {
    try {
      const response = await fetch(`${url}/escultores/`);
      if (!response.ok) {
        throw new Error("Error al obtener los escultores");
      }
      const data = await response.json();
      setEscultores(data); 
      
    } catch (error) {
      console.error("Error al cargar escultores:", error);
    }
  };


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
    if (nuevoEscultor) {
      // Crear nuevo escultor
     
      const formData = new FormData();
  
      formData.append("nombre", eventData.nombre);
      formData.append("apellido", eventData.apellido);
      formData.append("pais_id", eventData.nacionalidad);
      formData.append("correo", eventData.correo);
      formData.append("bibliografia", eventData.bibliografia);
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("foto", fileInput.files[0]);
      } else {
        console.error("No se ha seleccionado un archivo.");
        return;
      }
      console.table(formData)
      
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


  
        const escultor = await response.json(); 
      


        await crearRelacionEventoEscultor(escultor.id);
       
        setEventData({
          nombre: "",
          apellido: "",
          nacionalidad: "",
          correo: "",
          bibliografia: "",
          escultor: ""  
        });

      } catch (error) {
        console.error("Error al guardar el escultor:", error);
        return;
      }
    } else {
      const escultorId = parseInt(eventData.escultor, 10);
      if (!escultorId) {
        console.error("No se seleccionó un escultor.");
        return;
      }
  
      try {
        await crearRelacionEventoEscultor(escultorId);
      } catch (error) {
        console.error("Error al crear la relación evento-escultor:", error);
        return;
      }
    }
  
    onNuevoEscultor();
    onClose();
  };
  

  const crearRelacionEventoEscultor = async (escultorId: number) => {
    const relacionData = {
      evento_id: eventoId, 
      escultor_id: escultorId,
    };
  
    try {
      const response = await fetch(`${url}/escultor_evento/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify(relacionData),
      });
  
      if (!response.ok) {
        throw new Error("Error al crear la relación evento-escultor");
      }
     
      console.log("Relación creada con éxito.");
    } catch (error) {
      console.error("Error al crear la relación evento-escultor:", error);
      throw error;
    }
  };
  

  useEffect(() => {
    
    
    if (isOpen) {
      fetchEscultores();
      fetchCountries();
      
    }
  }, [isOpen]);


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
        <h2>Añadir participante</h2>
        <div className="divider"></div>

        <form className="form">
          {!nuevoEscultor &&
          <>
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
            <div className="center">
            <button
              type="button"
              className="btn cancelar"
              onClick={() => setNuevoEscultor(true)}
              >Crear escultor
              </button>
            </div>
           
        </>
            
          }
          
          {nuevoEscultor &&
            <>
           
           
            <div className="personaldates">
       
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={eventData.nombre}
                onChange={handleInputChange}
                className="focus-input" />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={eventData.apellido}
                onChange={handleInputChange}
                className="focus-input" />
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
                className="focus-input" />
            </div><textarea
                name="bibliografia"
                placeholder="Bibliografia"
                value={eventData.bibliografia}
                onChange={handleInputChange}
                className="focus-input" /><div className="custom-file-upload active">
                <label htmlFor="file-upload">
                  {fileName ? <p>Archivo seleccionado: {fileName}</p> : <p>Seleccionar archivo {fileName}</p>}

                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }} />

              </div>
              <div className="center">
            <button
            type="button"
            className="btn cancelar"
            onClick={() => setNuevoEscultor(false)}
              >Seleccionar escultor</button>        
            </div></>

          }
          
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

