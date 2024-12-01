import { API_URL } from "astro:env/client";
import { formatearFecha, getUrlParams } from "./utils";

const URL_EVENTOS = `${API_URL}/api/eventos/`;

const params = getUrlParams();

const shareButton = document.querySelector(
	".share-button",
) as HTMLButtonElement;
const urlToShare = `https://erincondelinge.org/detalle_evento.html?id=${params.id}`;
const messageToShare = "¡Miren ese increíble evento de la Bienal del Chaco!";

async function loadEvento(URL: string, id: string) {
	const loadingIndicator = document.getElementById("loading-indicator");

	if (!loadingIndicator) {
		throw Error("No se encuentra el elemento Loading indicator.");
	}

	const mainContent = document.querySelector(
		".section-certamen",
	) as HTMLElement;
	const divider = document.querySelector(".divider-sm") as HTMLElement;

	try {
		loadingIndicator.style.display = "flex";
		mainContent.style.display = "none";

		const res = await fetch(`${URL}${id}`);
		const evento = await res.json();

		const titulo = document.querySelector(
			"#nombre-evento",
		) as HTMLHeadingElement;
		const titulo2 = document.querySelector(
			"#nombre-evento-h2",
		) as HTMLHeadingElement;
		const fecha = document.querySelector("#fecha-evento") as HTMLHeadingElement;
		const descripcion = document.querySelector(
			"#descripcion-evento",
		) as HTMLParagraphElement;
		const lugarNombre = document.querySelector(
			"#lugar-evento",
		) as HTMLHeadingElement;
		const lugarDescripcion = document.querySelector(
			"#lugar-descripcion",
		) as HTMLParagraphElement;
		const imagenEvento = document.querySelector(
			"#imagen-evento",
		) as HTMLImageElement;

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
			this.src =
				"https://storage.cloud.google.com/bienaldelchaco/img/media/fondo.jpg";
			this.onerror = null;
		};
	} catch (error) {
		console.log(`Error al cargar el evento: ${error}`);
	} finally {
		loadingIndicator.style.display = "none";
		mainContent.style.display = "flex";
		divider.style.display = "block";
	}
}

// if (window.location.pathname.includes("detalle_evento.html")) {
// 	const params = new URLSearchParams(window.location.search);
const id = params["id"];
loadEvento(URL_EVENTOS, id);
// }

const icons = shareButton.querySelectorAll(".button__icon i");
const buttontext = document.querySelector(".button__text") as HTMLElement;
buttontext.addEventListener("click", () => {
	shareButton.classList.add("active");
});

for (const icon of icons) {
	const network = (icon as HTMLElement).title;

	icon.addEventListener("click", (event) => {
		event.stopPropagation();
		shareButton.classList.remove("active");

		console.log(`Compartir en ${network}`);

		let shareUrl = "";
		if (network === "twitter") {
			shareUrl = `https://twitter.com/intent/tweet?url=${urlToShare}&text=${messageToShare}`;
		} else if (network === "facebook") {
			shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${urlToShare}`;
		} else if (network === "whatsapp") {
			shareUrl = `https://wa.me/?text=${messageToShare}: ${urlToShare}`;
		}

		if (shareUrl) {
			window.open(shareUrl, "_blank");
		}
	});
}
