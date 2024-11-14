const URL_EVENTOS = "http://localhost:8000/api/eventos/";

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
          <div class="descripcion-evento">
            <h3>${evento[index].nombre}</h3>
            <div>
              <i class="material-icons-outlined">&#xebcc;</i>
              <p>${formatearFecha(evento[index].fecha_inicio)} - \u200B<span>${formatearFecha(evento[index].fecha_fin)}</ span></p>
            </div>
          </div>
        `;
			}
		}
	} catch (error) {
		console.log(`Error al carga los eventos: ${error}`);
	}
}

loadEventos(URL_EVENTOS);
