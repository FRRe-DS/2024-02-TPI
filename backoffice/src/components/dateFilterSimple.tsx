import { useState } from "react";
import "./dateFilterSimple.css";
import PopupDateRange from "./popupDateRange";

type DateFilterProps = {
  startDate: string | null;
  endDate: string | null;
  onDateChange: (startDate: string | null, endDate: string | null) => void;
};

export default function DateFilterSimple({
  startDate,
  endDate,
  onDateChange,
}: DateFilterProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePopup = () => {
    setIsPopupOpen((prev) => !prev);
  };

  const updateDateRange = (newStartDate: string | null, newEndDate: string | null) => {
    onDateChange(newStartDate, newEndDate);
    setIsPopupOpen(false);
  };

  const displayText = startDate && endDate ? `${startDate} - ${endDate}` : "Rango de fecha";

  return (
    <>
      <PopupDateRange
        isPopupOpen={isPopupOpen}
        handlePopup={handlePopup}
        onAccept={updateDateRange}
      />
      <div className="input-filter__container" onClick={handlePopup}>
        <input type="button" value={displayText} className="input-filter" />
        <span className="material-symbols-outlined">calendar_month</span>
      </div>
    </>
  );
}
