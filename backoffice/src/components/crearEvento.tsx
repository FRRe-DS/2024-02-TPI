import { useState, useEffect } from "react";
import "./crearEvento.css";
import dayjs from "dayjs";
import "dayjs/locale/es";


interface NuevoEventoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNuevoEvento: () => void
}


export default function NuevoEventoPopup({ 
  isOpen, onClose,  onNuevoEvento }: NuevoEventoPopupProps) {
  const [nombreTematica, setNombreTematica] = useState("");
  const [descripcionTematica, setDescripcionTematica] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [eventData, setEventData] = useState({
    nombre: "",
    lugar_id: "",
    tematica_id: "",
    descripcion: "",
    foto: null as File | null,
  });
  const [nombreLugar, setNombreLugar] = useState('');
  const [descripcionLugar, setDescripcionLugar] = useState('');
  const [agregarLugar, setAgregarLugar] = useState(false); 
  const [agregarTematica, setAgregarTematica] = useState(false); 
  
  const [tematicas, setTematicas] = useState<{ id: number; nombre: string }[]>([]);
  const [lugares, setLugares] = useState<{ id: number; nombre: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const url = "http://localhost:8000/api";

  const authToken = localStorage.getItem("token");
  if (!authToken) {
    throw new Error("Token no encontrado. Inicia sesión nuevamente.");
  }

  useEffect(() => {
    if (isOpen) {
      const fetchOptions = async () => {
        try {
          // Obtener lugares
          const lugaresRes = await fetch(`${url}/lugar/`);
          if (!lugaresRes.ok) {
            throw new Error("Error al cargar las opciones de lugares.");
          }
          const lugaresData = await lugaresRes.json();
          setLugares(lugaresData);

          // Obtener temáticas
          const tematicasRes = await fetch(`${url}/tematica/`);
          if (!tematicasRes.ok) {
            throw new Error("Error al cargar las opciones de temáticas.");
          }
          const tematicasData = await tematicasRes.json();
          setTematicas(tematicasData);

        } catch (err) {
          setError("No se pudieron cargar las opciones.");
        }
      };

      fetchOptions();
    }
  }, [isOpen]); 

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];  
    const fileContainer = document.querySelector(".custom-file-upload")
    if (file) {
      fileContainer?.classList.add("activeFile")
      setFileName(file.name); 
    }
  };


  const validateForm = (
    nombre: string,
    lugar: number,
    tematica: number,
    startDate: Date | null,
    endDate: Date | null
  ) => {
    if (!nombre || !lugar || !tematica || !startDate || !endDate) {
      setError("Todos los campos son obligatorios.");
      return false;
    }
    if (dayjs(startDate).isAfter(dayjs(endDate))) {
      setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleAgregarLugar = () => {
    setAgregarLugar(prevState => !prevState);
  };

  const handleAgregarTematica = () => {
    setAgregarTematica(prevState => !prevState);
  };

  const crearTematica = async (tematica_nombre: string, tematica_descripcion: string) => {
    try {
      const response = await fetch(`${url}/tematica/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',         
          Authorization: `Token ${authToken}`, 
          
        },
        body: JSON.stringify({
          nombre: tematica_nombre,
          descripcion: tematica_descripcion,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la temática');
      }

      const data = await response.json();
      return data.id; 
    } catch (error) {
      console.error(error);
      setError('Hubo un error al crear la temática.');
      return null;
    }
  };

  const crearLugar = async (nombre:string, descripcion:string) => {
    try {
      const response = await fetch(`${url}/lugar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify({
          nombre: nombre,
          descripcion: descripcion,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error al crear el lugar');
      }
  
      const data = await response.json();
      return data.id; 
    } catch (error) {
      console.error('Error al crear lugar:', error);
      return null;  
    }
  }

  const handleSubmit = async () => {

    const formData = new FormData();

   
    const tematica_id = agregarTematica ?  await crearTematica(nombreTematica, descripcionTematica) : eventData.tematica_id
    const lugar_id = agregarLugar ? await crearLugar(nombreLugar, descripcionLugar) : eventData.lugar_id 

    if (!validateForm(eventData.nombre, lugar_id, tematica_id, startDate ,endDate)) return;

    const fechaInicioString = startDate ? startDate.toISOString().split("T")[0] : "";
    const fechaFinString = endDate ? endDate.toISOString().split("T")[0] : "";
  
    formData.append("nombre", eventData.nombre);
    formData.append("lugar_id", lugar_id.toString());
    formData.append("tematica_id", tematica_id.toString());
    formData.append("fecha_inicio", fechaInicioString);
    formData.append("fecha_fin", fechaFinString);
    formData.append("descripcion", eventData.descripcion);
    if (eventData.foto) {
      formData.append("foto", eventData.foto);
    }

    try {
      const response = await fetch(`${url}/eventos/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${authToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log("Evento creado exitosamente");
        onNuevoEvento(); 
        onClose(); 
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Error al crear el evento.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };
 
  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="popupContainer ">
        <h2>Agregar evento</h2>
        <div className="divider"></div>
        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <h3>Información del evento</h3>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del evento"
            value={eventData.nombre}
            onChange={handleInputChange}
            required
            className="focus-input"
          />

<div className="fechas">
            <input
              type="date"
              value={startDate ? startDate.toISOString().split("T")[0] : ""}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              required
              className="focus-input"
            />
            <input
              type="date"
              value={endDate ? endDate.toISOString().split("T")[0] : ""}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              required
              className="focus-input"
            />
          </div>

          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={eventData.descripcion}
            onChange={handleInputChange}
            className="focus-input"
            required
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

          <h3>Información del lugar</h3>
           {!agregarLugar ? (
            <div className="inline-flex">
              <select
                name="lugar_id"
                value={eventData.lugar_id}
                onChange={handleInputChange}
                required
                className="focus-input"
              >
                <option value="" disabled>
                  Seleccione un lugar
                </option>
                {lugares.map((lugar) => (
                  <option key={lugar.id} value={lugar.id}>
                    {lugar.nombre}
                  </option>
                ))}
              </select>
              <div className="align-center">
                <button className="add" title="Agregar lugar" onClick={handleAgregarLugar}>
                  <i className="material-symbols-outlined">&#xe145;</i>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid-gap-12">
              <input
                type="text"
                name="lugar_nombre"
                placeholder="Nombre del lugar"
                className="focus-input"
                value={nombreLugar}
                onChange={(e) => setNombreLugar(e.target.value)}
                required
              />
              <input
                type="text"
                name="lugar_descripcion"
                placeholder="Descripción del lugar"
                className="focus-input"
                value={descripcionLugar}
                onChange={(e) => setDescripcionLugar(e.target.value)}
              />
              <button onClick={handleAgregarLugar} className="btn cancelar">Cancelar</button>
            </div>
          )}
          
          <h3>Información de la temática</h3>
          {!agregarTematica ? (
            <div className="inline-flex">
              <select
                name="tematica_id"
                value={eventData.tematica_id}
                onChange={handleInputChange}
                required
                className="focus-input"
              >
                <option value="" disabled>
                  Seleccione un lugar
                </option>
                {tematicas.map((tematica) => (
                  <option key={tematica.id} value={tematica.id}>
                    {tematica.nombre}
                  </option>
                ))}
              </select>
              <div className="align-center">
                <button className="add" title="Agregar tematica" onClick={handleAgregarTematica}>
                  <i className="material-symbols-outlined">&#xe145;</i>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid-gap-12">
               <input
                type="text"
                name="tematica_nombre"
                placeholder="Nombre de la temática"
                value={nombreTematica}
                onChange={(e) => setNombreTematica(e.target.value)}
                required
                className="focus-input"
              />
              <input
                type="text"
                name="tematica_descripcion"
                className="focus-input"
                placeholder="Descripción"
                value={descripcionTematica}
                onChange={(e) => setDescripcionTematica(e.target.value)}
              />  
              <button onClick={handleAgregarTematica} className="btn cancelar">Cancelar</button>
            </div>
          )}   
          <div className="divider"></div>

          {error && <p className="error">{error}</p>}

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
