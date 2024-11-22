import { loadHTML } from "../app";

console.log(__API_URL__);
const URL_ESCULTORES = `${__API_URL__}/api/escultores/`;
const URL_PAIS = `${__API_URL__}/api/paises/`;
const URL_TEMATICA = `${__API_URL__}/api/tematica/`;
const URL_EVENTOS = `${__API_URL__}/api/eventos/`;

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
function urlFotoEscultor(url: string) {
	if (url.includes("perfiles")) {
		// Cuando la imagen la cargamos desde la bd:
		return url;
	}

	const foto_url = url.slice(url.lastIndexOf("/") + 1);
	return `https://drive.google.com/thumbnail?id=${foto_url}`;
}

// ------ Formatear correctamente el nombre ------
function formatearNombre(nombre: string, apellido: string) {
	const nom = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
	const ape =
		apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();

	const nombreFormateado = `${nom} ${ape}`;
	return nombreFormateado;
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
							<a href="">Ver más</a>
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

					// con el id del escultor puedo hacer escultores[id-1].nombre, etc
					const id = btnTarget.getAttribute("data-id") ?? " ";

					const email = localStorage.getItem("userEmail");

					// Al hacer click en el btn votar en un escultor verificamos primero si tenemos un mail en el localstorage, esto implica que ya se
					// voto antes y quedo validado el mail, entonces solo le muestro un popup para votar, en caso contrario lo mando a la pantalla de
					// validadr.html para validad su mail.
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

						Voto(email, id);
					} else {
						// Le paso el id a validar.html entonces puedo obtener los datos de ese escultor, su nombre y su foto
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

function Voto(correo: string, escultor_id: string) {
	document.getElementById("votoForm")?.addEventListener("submit", async (e) => {
		e?.preventDefault();

		const form = e.target as HTMLFormElement;
		const puntajeInput = form.elements.namedItem(
			"rating",
		) as HTMLInputElement | null;
		const puntaje = puntajeInput ? puntajeInput.value : "";

		type Response = {
			status: string;
			error: string;
		};

		try {
			const data = { escultor_id: escultor_id, puntaje: puntaje };
			console.table(data);

			const response = await fetch(
				`${__API_URL__}/api/voto_escultor/?correo_votante=${correo}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				},
			);

			if (response.status === 201) {
				const data: Response = await response.json();
				localStorage.setItem("userEmail", correo);
				alert(`El voto se ha registrado de manera exitosa: ${data.status}`);
			} else {
				const data: Response = await response.json();
				alert(`Ha ocurrido un fallo al registrar su voto:${data.error}`);
			}
		} catch (error) {
			console.error("Server error:", error);
		}
	});
}

loadHTML("header.html", "header", "certamen");
inicializar();
