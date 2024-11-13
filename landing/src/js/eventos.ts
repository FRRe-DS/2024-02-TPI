const URL_EVENTOS = "http://localhost:8000/api/eventos/";

function formatearFecha(fechaString:string) {
  const [year, month, day] = fechaString.split("-").map(Number);;

  const fecha = new Date(year, month - 1, day); 
  
  const opciones: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short" };
  return fecha.toLocaleDateString("es-ES", opciones);
}

// ------ Elegir imagen, esto es solamente provisorio ahsta que gonza agregue las imagenes en la BD ------
const imagenes = [
  "../images/Eventos/ConcursoInternacionalDeEsculturas.webp",
  "../images/Eventos/ConferenciasYcharlas.webp",
  "../images/Eventos/EspectáculosMusicaEnVivo.webp",
  "../images/Eventos/ExposicionesDeArte.webp",
  "../images/Eventos/IntervencionesUrbanas.webp",
  "../images/Eventos/RecorridosGuiado.webp",
  "../images/Eventos/TalleresYCapacitacion.webp",
  "../images/Eventos/ExhibicionesDeRealidadVirtual.webp",
  "../images/Eventos/PerformanceEnVivo.webp",
  "../images/Eventos/FestivalGastronomico.webp",
  "../images/Eventos/ProyeccionesDeCine.webp",
  "../images/Eventos/PremiaciónyClausura.webp",
  "../images/Eventos/ActividadesParaNiños.webp",
  "../images/Eventos/ArtistasInvitadosInternacionales.webp",
  "../images/Eventos/FeriaDeArtesania.webp"

]

function elegirImagen(nombreImg:string){
  const indice = imagenes.findIndex((ruta) => ruta.includes(nombreImg.split(" ")[0]));
  console.log(imagenes[indice])
  return imagenes[indice]
}

// ------ Get eventos ------

async function loadEventos(url: string) {
  try {
    const res = await fetch(url);
    const eventos = await res.json();
    console.log(eventos)
    
    const contendor_eventos = document.querySelector(".events-gallery")

    if (contendor_eventos){
      for(const evento of eventos){
        const card = document.createElement('div');
        card.classList.add('event-card');
        
        
        card.style.backgroundImage = `url('${elegirImagen(evento.nombre)}')`

        card.innerHTML = `
            <div class="card-content">
              <h2>${evento.nombre}</h2>
              <div>
                <i class="material-icons-outlined">&#xebcc;</i>
                <p>${formatearFecha(evento.fecha_inicio)} - \u200B<span>${formatearFecha(evento.fecha_fin)}</ span></p>
              </div>
            </div>
            <button class="btn-secundarioV3">Ver detalles</button>
      `;
      contendor_eventos.appendChild(card);
      }
    }
   
  } catch (error) {
    console.log(`Error al carga los eventos: ${error}`);
  }
}

loadEventos(URL_EVENTOS);

