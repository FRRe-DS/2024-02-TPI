import { setPaginaActual } from "./utils";

export function formatearFecha(fechaString: string) {
	const [year, month, day] = fechaString.split("-").map(Number);

	const fecha = new Date(year, month - 1, day);

	const opciones: Intl.DateTimeFormatOptions = {
		day: "2-digit",
		month: "short",
	};
	return fecha.toLocaleDateString("es-ES", opciones);
}

export function loadHTML(
	file: string,
	elementId: string,
	paginaActual: string,
): void {
	fetch(file)
		.then((response) => {
			if (!response.ok) throw Error("Error al cargar el archivo");
			return response.text();
		})
		.then((data) => {
			const element = document.getElementById(elementId);
			if (element) {
				element.innerHTML = data;
				if (paginaActual) {
					setPaginaActual(paginaActual);
				}
			}
		})
		.catch((error) => console.error(error));
}

loadHTML("footer.html", "footer", "");
