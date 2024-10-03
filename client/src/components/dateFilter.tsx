import { useState } from "react";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import "./filter.css";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function DateFilter({ text }: { text: string }) {
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(dayjs());

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePopup = () => {
    if (isPopupOpen) {
      setIsPopupOpen(false);
    } else {
      setIsPopupOpen(true);
    }
  };

  return (
    <div className="input-filter__container" onClick={handlePopup}>
      <div className={isPopupOpen ? "popUp-datepicker" : ""}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <StaticDatePicker
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />
          <StaticDatePicker
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
          />
        </LocalizationProvider>
        <button onClick={handlePopup}>Close</button>
      </div>

      <input type="button" value={text} className="input-filter" />
      <span className="material-symbols-outlined">keyboard_arrow_down</span>
    </div>
  );
}
