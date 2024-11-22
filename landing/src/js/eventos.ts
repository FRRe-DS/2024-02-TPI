const URL_EVENTOS = `${__API_URL__}/api/eventos/`;
import { formatearFecha, loadHTML } from "../app";

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
            <img class="card-img-evento" loading="lazy" src="${evento.foto}" alt="${evento.nombre}">
            <div class="card-content">
              <h2>${evento.nombre}</h2>
              <div>
                <i class="material-icons-outlined">&#xebcc;</i>
                <p>${formatearFecha(evento.fecha_inicio)} - \u200B<span>${formatearFecha(evento.fecha_fin)}</ span></p>
              </div>
            </div>
            <a href="${evento.id === 1 ? "certamen.html" : `detalle_evento.html?id=${evento.id}`}" class="btn-secundarioV3">Ver detalles</a>
      `;
				contendor_eventos.appendChild(card);
			}
		}
	} catch (error) {
		console.log(`Error al carga los eventos: ${error}`);
	}
}

// ------------
loadHTML("header.html", "header", "eventos");
loadEventos(URL_EVENTOS);
