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
				 <a class="mosaico-a" href="${evento[index].id === 1 ? "certamen.html" : `detalle_evento.html?id=${evento[index + 1].id}`}">
					<img class="card-img-evento" loading="lazy" src="${evento[index + 1].foto}" alt="${evento[index + 1].nombre}" onerror="this.src='https://storage.cloud.google.com/bienaldelchaco/img/media/fondo.jpg'; this.onerror=null;">
          <div class="descripcion-evento">
            <h3>${evento[index + 1].nombre}</h3>
            <div>
              <i class="material-icons-outlined">&#xebcc;</i>
              <p>${formatearFecha(evento[index + 1].fecha_inicio)} - \u200B<span>${formatearFecha(evento[index + 1].fecha_fin)}</ span></p>
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


if (window.location.pathname.includes("")) {
	loadHTML("header.html", "header", "inicio");
	loadHTML("footer.html", "footer", "inicio");
	loadEventos(URL_EVENTOS);
}