import { useState } from "react";
import "./crearEvento.css";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import DateFilter from "../components/dateFilterSimple";


interface NuevoEventoPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NuevoEventoPopup({ isOpen, onClose }: NuevoEventoPopupProps) {
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [eventData, setEventData] = useState({
    nombre: "",
    lugar: "",
    tematica: "",
    descripcion: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Datos del evento:", {
      ...eventData,
      inicio: startDate ? dayjs(startDate).format("YYYY-MM-DD") : null,
      fin: endDate ? dayjs(endDate).format("YYYY-MM-DD") : null,
    });
    onClose(); // Cierra el popup al enviar
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="popup">
        <h3>Nuevo Evento</h3>
        <form className="form">
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del evento"
            value={eventData.nombre}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="lugar"
            placeholder="Lugar"
            value={eventData.lugar}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="tematica"
            placeholder="Temática"
            value={eventData.tematica}
            onChange={handleInputChange}
          />
          <div className="fechas">
            <DateFilter text="Inicio"/>
            <DateFilter text="Fin" />
          </div>
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={eventData.descripcion}
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

