import { useState } from "react";
import "./dateFilter.css";
import PopupDateRange from "./popupDateRange";

export default function DateFilter({ text }: { text: string }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePopup = () => {
    if (isPopupOpen) {
      setIsPopupOpen(false);
      console.log(isPopupOpen);
    } else {
      setIsPopupOpen(true);
      console.log(isPopupOpen);
    }
  };

  return (
    <>
      <PopupDateRange isPopupOpen={isPopupOpen} handlePopup={handlePopup} />
      <div className="input-filter__container" onClick={handlePopup}>
        <input type="button" value={text} className="input-filter" />
        <span className="material-symbols-outlined">calendar_month</span>
      </div>
    </>
  );
}
