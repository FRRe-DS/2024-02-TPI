import { formatearFecha, loadHTML } from "../app";

const URL_EVENTOS = `${__API_URL__}/api/eventos/`;

async function loadEvento(URL: string, id: string) {
  const loadingIndicator = document.getElementById("loading-indicator")!;
  const mainContent = document.querySelector(".section-certamen") as HTMLElement;
	const divider = document.querySelector(".divider-sm") as HTMLElement;


  try {
    loadingIndicator.style.display = "flex";
    mainContent.style.display = "none";

    const res = await fetch(`${URL}${id}`);
    const evento = await res.json();

    const titulo = document.querySelector("#nombre-evento") as HTMLHeadingElement;
    const titulo2 = document.querySelector("#nombre-evento-h2") as HTMLHeadingElement;
    const fecha = document.querySelector("#fecha-evento") as HTMLHeadingElement;
    const descripcion = document.querySelector("#descripcion-evento") as HTMLParagraphElement;
    const lugarNombre = document.querySelector("#lugar-evento") as HTMLHeadingElement;
    const lugarDescripcion = document.querySelector("#lugar-descripcion") as HTMLParagraphElement;
    const imagenEvento = document.querySelector("#imagen-evento") as HTMLImageElement;

    const lugar = evento.lugar;

    titulo.textContent = evento.nombre;
    titulo2.textContent = evento.nombre;
    fecha.textContent = `${formatearFecha(evento.fecha_inicio)} - ${formatearFecha(evento.fecha_fin)}`;
    descripcion.textContent = evento.descripcion;
    lugarNombre.textContent = lugar.nombre;
    lugarDescripcion.textContent = lugar.descripcion;

    imagenEvento.src = evento.foto;
    imagenEvento.loading = "lazy";
    imagenEvento.title = evento.nombre;

  
    imagenEvento.onerror = function () {
      this.src = "https://storage.cloud.google.com/bienaldelchaco/img/media/fondo.jpg";
      this.onerror = null;
    };
  } catch (error) {
    console.log(`Error al cargar el evento: ${error}`);
  } finally {
    loadingIndicator.style.display = "none";
    mainContent.style.display = "flex";
		divider.style.display = "block"
  }
}

if (window.location.pathname.includes("detalle_evento.html")) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") as string;

  loadHTML("header.html", "header", "eventos");
  loadHTML("footer.html", "footer", "eventos");
  loadEvento(URL_EVENTOS, id);
}