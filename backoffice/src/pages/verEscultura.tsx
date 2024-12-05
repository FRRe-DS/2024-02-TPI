import { useEffect, useState } from "react";

import Menu from "./menu/Menu";
import "./pages.css";
import "../components/btn.css";
import "./verEscultura.css";
import { useParams } from "react-router-dom";
import { url } from "../utils";
import AgregarImagenPopup from "../components/agregarImagen";

type Imagen = {
  id: number;
  fecha_creacion: string;
  imagen: string;
  escultura_id: number;
}

type Escultor = {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    foto: string;
    bibliografia: string;
    nacionalidad: string;
    nombre_completo: string;
};

type Escultura = {
  id: number;
  imagenes: Imagen[];
  nombre: string;
  descripcion: string;
  fechaCreacion: string;
  escultor_id: Escultor[];
};

export default function VerEscultura() {
  const { id } = useParams(); // Obtener el ID de la escultura desde la URL
  const [escultura, setEscultura] = useState<Escultura | null>(null);
  const [error, setError] = useState<string | null>(null);

  type EscultorResponse = {
    id: number;
    nombre: string;
    apellido: string;
    nombre_completo: string;
    correo: string;
    foto: string;
    bibliografia: string;
    fecha_nacimiento: string;
    esculturas: object[];
    eventos: object[];
    pais: {
        id: number;
        iso: string;
        nombre: string;
    };
  };

  async function fetchEscultura() {
    try {
      const response = await fetch(`${url}/esculturas/${id}`);
      if (!response.ok) {
        throw new Error("Error al obtener los datos de la escultura.");
      }
      const data: Escultura = await response.json();
      setEscultura(data);
      setError(null);
    } catch (err) {
      console.error("Error al obtener la escultura:", err);
      setError("No se pudo cargar la escultura. Inténtalo más tarde.");
    } finally {
    }
  }

  const [escultor, setEscultor] = useState<Escultor>();

  async function fetchEscultor() {
  
    try {
        const response = await fetch(`${url}/escultores/${id}/`); 
        if (!response.ok) {
            throw new Error("Error al obtener el escultor");
        }

        const escultorResp: EscultorResponse = await response.json();

        const escultorData: Escultor = {
            id: escultorResp.id,
            nombre: escultorResp.nombre,
            apellido: escultorResp.apellido,
            correo: escultorResp.correo,
            foto: escultorResp.foto,
            bibliografia: escultorResp.bibliografia,
            nacionalidad: escultorResp.pais.nombre || "Desconocido",
            nombre_completo: escultorResp.nombre_completo
        };

        setEscultor(escultorData);
    } catch (error) {
        console.error("Error al obtener el escultor:", error);
     
    }
  }

  useEffect(() => {
    fetchEscultura();
    fetchEscultor()
  }, [id]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  return (
    <div className="mainContainer">
      <Menu paginaActual={"Esculturas"} />
      <section className="mainSection">
        <header className="header-section">
          <h1 className="header-title">Galería de imágenes</h1>
          <button className="btn-principal" onClick={handleOpenPopup}>Agregar imagen</button>
          <AgregarImagenPopup isOpen={isPopupOpen} onClose={handleClosePopup} esculturaId={escultura?.id} onUpdate={fetchEscultura}/>
        </header>
        <div className="section-container">
          <div className="grid-ver-escultura">
          <div className="contenedor-info-escultor-v2">      
           
           <div className="container-ver-escultura info-escultor">
           <h2 className="">{escultura?.nombre}</h2>
           <p className="color-p-grey">{escultura?.descripcion}</p>
           <div className="divider"  ></div>
             <h2 className="">Autor</h2>
             <div className="group">
               <h3 >{escultor?.nombre_completo}</h3>
               <p className="color-p-grey">{escultor?.nacionalidad}</p>
             </div>
   
               <img className="foto-escultor"
                 src={escultor?.foto}
               />  
           </div>
         
         </div>

         <div className="image-gallery">
           {escultura?.imagenes.map((imagen) => (
             <div className="image-placeholder">
               <img 
                 key={imagen.id}
                 src={imagen.imagen}
                 alt={`Imagen de ${escultura.nombre}`}
               />
             </div>
           ))}
         </div>


          </div>
          
        </div>
      </section>
    </div>
  );
}
