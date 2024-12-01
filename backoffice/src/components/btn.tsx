import "./btn.css";
import { useState } from "react";
import NuevoEscultorPopup from "./crearEscultor";
import NuevaEsculturaPopup from "./crearEscultura";
import AgregarImagenPopup from "./agregarImagen";

export default function Btn({ text }: { text: string }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);
  
  switch(text){
  
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

      case 'Agregar imagen':
        return(
          <><button className="btn-principal" onClick={handleOpenPopup}>{text}</button><AgregarImagenPopup isOpen={isPopupOpen} onClose={handleClosePopup} /></>
      );
      break;
  }
}
