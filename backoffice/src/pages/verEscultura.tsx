import { useEffect, useState } from "react";
import Btn from "../components/btn";
import Menu from "./menu/Menu";
import "./pages.css";
import "./verEscultura.css";
import { useParams } from "react-router-dom";

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

  const url = "http://localhost:8000/api";

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

  // Función para obtener los datos de la escultura
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
        const response = await fetch(`${url}/escultores/${id}/`); // Cambiado para obtener un solo escultor por su ID
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

  return (
    <div className="mainContainer">
      <Menu paginaActual={"Esculturas"} />
      <section className="mainSection">
        <header className="header-section">
          <h1 className="header-title">Galería de imágenes</h1>
          <Btn text="Agregar imagen" />
        </header>
        <div className="content">
          {/* Panel de información */}
          <div className="info-panel">
            <h2 className="escultura-title">{escultura?.nombre}</h2>
            <h3 className="section-title">Descripción</h3>
            <p>{escultura?.descripcion}</p>
            <h3 className="section-title">Autor</h3>
            <div className="author-info">
              <div className="prueba">
              <img className="imagen"
                  src={escultor?.foto}
                />
              </div>
            </div>
            <div>
                <p className="author-name">{escultor?.nombre_completo}</p>
                <p className="author-nationality">{escultor?.nacionalidad}</p>
              </div>
            <h3 className="section-title">Finalizada</h3>
            <p>{escultura?.fechaCreacion}</p>
          </div>
          {/* Galería de imágenes */}
          <div className="image-gallery">
            {escultura?.imagenes.map((imagen) => (
              <div className="image-placeholder">
                <img className="contenedor-info-escultor"
                  key={imagen.id}
                  src={imagen.imagen}
                  alt={`Imagen de ${escultura.nombre}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
