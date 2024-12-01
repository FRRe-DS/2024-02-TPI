import { API_URL } from "astro:env/client";
const URL_EVENTOS = `${API_URL}/api/eventos_por_anio/`;

export function formatearFecha(fechaString: string) {
	const [year, month, day] = fechaString.split("-").map(Number);

	const fecha = new Date(year, month - 1, day);

	const opciones: Intl.DateTimeFormatOptions = {
		day: "2-digit",
		month: "short",
	};
	return fecha.toLocaleDateString("es-ES", opciones);
}
// ------ Get eventos ------

async function loadEventos(url: string) {
	try {
		const res = await fetch(url);
		const eventos = await res.json();

		const contendor_eventos = document.querySelector(".events-gallery");

		if (contendor_eventos) {
			for (const evento of eventos) {
				const card = document.createElement("div");
				card.classList.add("event-card");

				card.innerHTML = `
            <img class="card-img-evento" 
						loading="lazy" 
						src="${evento.foto}" 
						alt="${evento.nombre}"
onerror="this.src='https://storage.cloud.google.com/bienaldelchaco/img/media/fondo.jpg'; this.onerror=null;">
            <div class="card-content">
              <h2>${evento.nombre}</h2>
              <div>
                <i class="material-icons-outlined">&#xebcc;</i>
                <p>${formatearFecha(evento.fecha_inicio)} - \u200B<span>${formatearFecha(evento.fecha_fin)}</ span></p>
              </div>
            </div>
            <a href="${evento.id === 1 ? "/certamen" : `/detalle_evento?id=${evento.id}`}" class="btn-secundarioV3">Ver detalles</a>
      `;
				contendor_eventos.appendChild(card);
			}
		}
	} catch (error) {
		console.log(`Error al carga los eventos: ${error}`);
	}
}

loadEventos(URL_EVENTOS);
