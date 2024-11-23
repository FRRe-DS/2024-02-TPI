import { loadHTML } from "../app";

const URL_ESCULTORES = "http://localhost:8000/api/escultores/";
const URL_PAIS = "http://localhost:8000/api/paises/";
const URL_TEMATICA = "http://localhost:8000/api/tematica/";
const URL_EVENTOS = "http://localhost:8000/api/eventos/";

async function inicializar() {
	try {
		const tematicaId = await loadInfoCertamen(URL_EVENTOS, "1");
		const tematicaObjeto = await loadTematica(URL_TEMATICA, tematicaId);

		const tematica = document.getElementById("tematica") as HTMLSpanElement;
		if (tematica && tematicaObjeto) {
			tematica.textContent = tematicaObjeto.nombre;
		}

		await loadEscultores(URL_ESCULTORES);
	} catch (error) {
		console.error("Error inicializando la página:", error);
	}
}

// ------ Get pais del escultor ------
async function loadPais(url: string, idPais: number) {
	try {
		const res = await fetch(`${url}${idPais}`);
		const pais = await res.json();

		return pais;
	} catch (error) {
		console.log(`Error al carga los paises: ${error}`);
	}
}

// ------ Get tematica del certamen ------

async function loadInfoCertamen(URL: string, id: string) {
	try {
		const res = await fetch(`${URL}${id}`);
		const evento = await res.json();

		return evento.tematica_id;
	} catch (error) {
		console.log(`Error al carga el evento: ${error}`);
	}
}
async function loadTematica(URL: string, id: string) {
	try {
		const res = await fetch(`${URL}${id}`);
		const tematica = await res.json();

		return tematica;
	} catch (error) {
		console.log(`Error al carga la tematica: ${error}`);
	}
}

// ------ Get url de la foto del escultor ------
export function urlFotoEscultor(url: string) {
	if (url.includes("perfiles")) {
		// Cuando la imagen la cargamos desde la bd:
		return url;
	}

	const foto_url = url.slice(url.lastIndexOf("/") + 1);
	return `https://drive.google.com/thumbnail?id=${foto_url}`;
}

// ------ Formatear correctamente el nombre ------
export function formatearNombre(nombre: string, apellido: string): string {
	const nom = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
	const ape =
		apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();

	const nombreFormateado = `${nom} ${ape}`;
	return nombreFormateado;
}

function Voto(correo: string, escultor_id: string) {
	document
		.getElementById(`votoForm-${escultor_id}`)
		?.addEventListener("submit", async (e) => {
			e.preventDefault();

			const formElement = e.target as HTMLFormElement;

			if (formElement) {
				const formData = new FormData(formElement);
				const rating = formData.get("rating");

				if (rating) {
					try {
						const response = await fetch(
							"http://localhost:8000/api/voto_escultor/",
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									puntaje: rating,
									escultor_id: escultor_id,
									correo_votante: correo,
								}),
							},
						);

						if (response.ok) {
							const data = await response.json();
							console.log("Rating enviado:", data);
							alert("¡Gracias por tu calificación!");
							localStorage.setItem("userEmail", correo);
							window.location.href = "./certamen.html";
						} else {
							alert("Usted ya ha votado a este escultor");
						}
					} catch (error) {
						console.error("Error al enviar rating:", error);
					}
				} else {
					alert("Por favor, selecciona una calificación.");
				}
			}
		});
}

// ------ Get escultores ------

async function loadEscultores(url: string) {
	try {
		const res = await fetch(url);
		const escultores = await res.json();
		const contenedor_escultores = document.querySelector(".grid-escultores");
		const totalEscultores = document.getElementById(
			"total-escultores",
		) as HTMLSpanElement;

		totalEscultores.textContent = escultores.length;

		if (contenedor_escultores) {
			for (const escultor of escultores) {
				const article = document.createElement("article");

				article.classList.add("card-escultor");
				const foto = urlFotoEscultor(escultor.foto);
				const pais = await loadPais(URL_PAIS, escultor.pais_id);
				const NyA = formatearNombre(escultor.nombre, escultor.apellido);

				article.innerHTML = `
						
						<img
								src="${foto}"
								loading="lazy"
								alt="${NyA}"
								class="escultor-img" />
						<div class="wrap-card">
							 <a href="detalle_escultor.html?id=${escultor.id}">Ver más</a>
							<div class="nombre-origen">
									<div class="space">
									<h3 id="nombre-escultor" >${NyA}</h3>
									</div>
									<p class="cursiva">${pais.nombre} </p>
									<button class="btn-votar" data-id="${escultor.id}">
									
									Votar
							</button>
							</div>
							
						</div>
						`;
				contenedor_escultores.appendChild(article);
			}

			// Agarro todos los botones de votar, y despues hago un for each para agregrarles a todos un eventlistener y usar el event.target para obtener el id del escultor que esta en un data-id en cada voton
			const botonesVotar = document.querySelectorAll(".btn-votar");

			const overlay = document.querySelector(".overlay") as HTMLButtonElement;
			const popupContainer = document.querySelector(
				".popUp-container",
			) as HTMLDivElement;
			const popup = document.querySelector(".popup") as HTMLElement;
			const cerrar_popup = document.querySelector(
				".cerrar-popup",
			) as HTMLButtonElement;

			for (const boton of botonesVotar) {
				boton.addEventListener("click", (event) => {
					event.preventDefault();
					const btnTarget = event.target as HTMLButtonElement;

					// con el id del escultor podemos usarlo para identificar al escultor
					const id = btnTarget.getAttribute("data-id") ?? " ";

					const email = localStorage.getItem("userEmail");

					if (email) {
						overlay.style.display = "block";
						popupContainer.style.display = "flex";
						const nombreEscultor = document.getElementById(
							"nombre-escultor",
						) as HTMLHeadElement;

						nombreEscultor.textContent = formatearNombre(
							escultores[Number(id) - 1].nombre,
							escultores[Number(id) - 1].apellido,
						);

						const formPopUp = document.createElement("form");

						formPopUp.id = `votoForm-${id}`;

						formPopUp.innerHTML = `
							<div class="rating">
								<input value="5" name="rating" id="star5" type="radio" />
								<label for="star5"></label>
								
								<input value="4" name="rating" id="star4" type="radio" />
								<label for="star4"></label>
								
								<input value="3" name="rating" id="star3" type="radio" />
								<label for="star3"></label>
								
								<input value="2" name="rating" id="star2" type="radio" />
								<label for="star2"></label>
								
								<input value="1" name="rating" id="star1" type="radio" />
								<label for="star1"></label>
							</div>
			
							<button type="submit" class="btn-votarV2">Votar</button>
						`;

						popup.appendChild(formPopUp);

						// Ahora pasamos el correo y el id del escultor a la función Voto
						Voto(email, id);
					} else {
						// Si no hay email en localStorage, redirigimos para validación
						window.location.href = `./validar.html?id=${id}`;
					}
				});
			}

			if (cerrar_popup) {
				cerrar_popup.addEventListener("click", () => {
					const form = popup?.querySelector("form");
					overlay.style.display = "none";
					popupContainer.style.display = "none";
					if (form) {
						popup.removeChild(form);
					}
				});
			}
		}
	} catch (error) {
		console.log(`Error al carga los escultores: ${error}`);
	}
}

loadHTML("header.html", "header", "certamen");
inicializar();
