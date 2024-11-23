const URL_EVENTOS = `${__API_URL__}/api/eventos/`;
import { loadHTML } from "../app";

function formatearFecha(fechaString: string) {
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
		const evento = await res.json();

		for (let index = 0; index < 7; index++) {
			const card = document.getElementById(`card-${index}`);

			if (card) {
				card.innerHTML = `
				 <a class="mosaico-a" href="${evento[index].id === 1 ? "certamen.html" : `detalle_evento.html?id=${evento[index].id}`}">
					<img class="card-img-evento" loading="lazy" src="${evento[index].foto}" alt="${evento[index].nombre}">
          <div class="descripcion-evento">
            <h3>${evento[index].nombre}</h3>
            <div>
              <i class="material-icons-outlined">&#xebcc;</i>
              <p>${formatearFecha(evento[index].fecha_inicio)} - \u200B<span>${formatearFecha(evento[index].fecha_fin)}</ span></p>
            </div>
          </div>
				</a>
        `;
			}
		}
	} catch (error) {
		console.log(`Error al carga los eventos: ${error}`);
	}
}

loadHTML("header.html", "header", "inicio");
loadEventos(URL_EVENTOS);
