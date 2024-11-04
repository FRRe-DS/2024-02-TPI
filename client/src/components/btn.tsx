import "./btn.css";
import { useState } from "react";
import NuevoEventoPopup from "./crearEvento";
import NuevoEscultorPopup from "./crearEscultor";
import NuevaEsculturaPopup from "./crearEscultura";

export default function Btn({ text }: { text: string }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);
  
  switch(text){
    case 'Nuevo evento':
      return(
        <><button className="btn-principal" onClick={handleOpenPopup}>{text}</button><NuevoEventoPopup isOpen={isPopupOpen} onClose={handleClosePopup} /></>
      );
      break;
  
      case 'Nuevo escultor':
      return(
        <><button className="btn-principal" onClick={handleOpenPopup}>{text}</button><NuevoEscultorPopup isOpen={isPopupOpen} onClose={handleClosePopup} /></>
      );
      break;

      case 'Nueva escultura':
      return(
        <><button className="btn-principal" onClick={handleOpenPopup}>{text}</button><NuevaEsculturaPopup isOpen={isPopupOpen} onClose={handleClosePopup} /></>
      );
      break;
  }
}
