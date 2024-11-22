import { formatearFecha, loadHTML } from "../app";

const URL_EVENTOS = `${__API_URL__}/api/eventos/`;
const URL_LUGAR = `${__API_URL__}/api/lugar/`;

async function loadLugar(URL: string, id: string) {
	try {
		const res = await fetch(`${URL}${id}`);
		const lugar = await res.json();

		return lugar;
	} catch (error) {
		console.log(`Error al carga el lugar: ${error}`);
	}
}

async function loadEvento(URL: string, id: string) {
	try {
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
		const lugar = await loadLugar(URL_LUGAR, evento.lugar_id);

		const imagenEvento = document.querySelector(
			"#imagen-evento",
		) as HTMLImageElement;

		titulo.textContent = evento.nombre;
		titulo2.textContent = evento.nombre;
		fecha.textContent = `${formatearFecha(evento.fecha_inicio)} - ${formatearFecha(evento.fecha_fin)}`;
		descripcion.textContent = evento.descripcion;
		lugarNombre.textContent = lugar.nombre;
		lugarDescripcion.textContent = lugar.descripcion;

		imagenEvento.src = evento.foto;
		imagenEvento.title = evento.nombre;
	} catch (error) {
		console.log(`Error al carga el evento: ${error}`);
	}
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id") as string;

loadHTML("header.html", "header", "eventos");
loadEvento(URL_EVENTOS, id);
