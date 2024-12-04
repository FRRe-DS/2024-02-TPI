import { API_URL } from "astro:env/client";
import { formatearFecha } from "./utils";

const URL_EVENTOS = `${API_URL}/api/eventos/`;

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
					<img class="card-img-evento" loading="lazy" src="${evento[index].foto}" alt="${evento[index].nombre}" onerror="this.src='src/assets/img_media_fondo.jpg'; this.onerror=null;">
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

loadEventos(URL_EVENTOS);
