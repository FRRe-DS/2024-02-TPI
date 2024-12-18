import { useState } from "react";
import "./popupDateRange.css";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

export default function PopupDateRange({
  isPopupOpen,
  handlePopup,
  onAccept,
}: {
  isPopupOpen: boolean;
  handlePopup: () => void;
  onAccept: (startDate: string, endDate: string) => void; // Si no deseas permitir null, usa strings
}) {
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);

  const handleAccept = () => {
    const formattedStartDate = startDate
      ? dayjs(startDate).format("ddd, D MMM YYYY")
      : "";
    const formattedEndDate = endDate
      ? dayjs(endDate).format("ddd, D MMM YYYY")
      : "";

    onAccept(formattedStartDate, formattedEndDate);
    handlePopup();
  };

  return (
    <>
      {isPopupOpen && (
        <>
          <div className="overlay" onClick={handlePopup}></div>
          <div className="popUp-datepicker">
            <section className="popUp-header">
              <h3>Seleccione un rango de fecha</h3>
              <p>
                {startDate
                  ? dayjs(startDate).format("ddd, D MMM YYYY")
                  : "Inicio"}{" "}
                - {endDate ? dayjs(endDate).format("ddd, D MMM YYYY") : "Fin"}
              </p>
            </section>
            <div className="calendar">
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="es">
                <DateCalendar
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                />
              </LocalizationProvider>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="es">
                <DateCalendar
                  value={endDate}
                  onChange={(newValue) => {
                    if (newValue < startDate) {
                      setStartDate(newValue);
                    } else {
                      setEndDate(newValue);
                    }
                  }}
                />
              </LocalizationProvider>
            </div>
            <footer className="popUp-footer">
              <button onClick={handlePopup} className="btnCancelar">
                Cancelar
              </button>
              <button onClick={handleAccept} className="btnAceptar">
                Aceptar
              </button>
            </footer>
          </div>
        </>
      )}
    </>
  );
}

