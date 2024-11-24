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
				
				if (elementId === "footer"){
					
					if (paginaActual !== "inicio"){
						const ubicacionElement = document.querySelector("#footer-ubicacion") as HTMLElement;
						const sponsor = document.querySelector("#footer-sponsors") as HTMLElement;
						if (ubicacionElement) {
							ubicacionElement.style.display = "none";
						}
				
						if (sponsor) {
							sponsor.style.display = "none";
						}
						}
					
				}
			
			
				if (paginaActual) {
					setPaginaActual(paginaActual);
				}
			}else {
				console.error(`Elemento con ID "${elementId}" no fue encontrado.`);
			}
		})
		.catch((error) => console.error(error));
}


