import React, { useState } from "react";
import "./crearEvento.css"
import { url } from "../utils";

interface AgregarImagenPopupProps {
  isOpen: boolean;
  onClose: () => void;
  esculturaId: number | undefined; 
  onUpdate: () => void; 
}

export default function AgregarImagenPopup({
  isOpen,
  onClose,
  esculturaId,
  onUpdate,
}: AgregarImagenPopupProps) {
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
     
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const authToken = localStorage.getItem("token");
  if (!authToken) {
    window.location.href = "/Login";
  }



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !descripcion || !esculturaId) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
     
      const formData = new FormData();
      formData.append("imagen", file); 
      formData.append("descripcion", descripcion);
      formData.append("escultura_id", esculturaId.toString()); 

   
      const response = await fetch(`${url}/imagenes/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${authToken}`,
      },
        body: formData,
      });

      if (response.ok) {
        console.log("Imagen subida correctamente.");
        onUpdate(); 
        onClose();
      } else {
        const errorData = await response.json();
        console.log(`Error al subir la imagen: ${errorData.detail || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
   
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="overlay" onClick={onClose}></div>
      <div className="popup">
        <h2>Agregar Imagen</h2>
        <div className="divider"></div>
        <form onSubmit={handleSubmit} className="form">
          <div className="one-col-grid">
  
            <div className="custom-file-upload">
              <label htmlFor="file-upload">
                {previewImage ? (
                  <div className="cambiar-img-grid">
                    <img src={previewImage} alt="Vista previa" />
                  </div>
                ) : file ? (
                  <div>
                    <p>Archivo seleccionado: {file.name}</p>
                  </div>
                ) : (
                  <p className="fill-space">Seleccionar foto</p>
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

          
            <div className="form">
              <textarea
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="focus-input texarea-bigger"
              />
            </div>
          </div>

          <div className="divider"></div>
          <div className="buttons">
            <button type="button" onClick={onClose} className="btn cancelar">
              Cerrar
            </button>
            <button type="submit" className="btn aceptar">
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
