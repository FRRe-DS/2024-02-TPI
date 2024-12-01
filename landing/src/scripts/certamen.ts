import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { API_URL } from "astro:env/client";
import { getUrlParams } from "./utils";

const URL_EVENTOS = `${API_URL}/api/eventos/`;
const check_puntaje = `${API_URL}/api/check_puntaje`;
const escultor_por_evento = `${API_URL}/api/escultores_por_evento/`;
const email = localStorage.getItem("userEmail");
const overlay = document.querySelector(".overlay") as HTMLDivElement;

const params = getUrlParams();
let anio = parseInt(params.anio, 10);
const certamenId: { [key: number]: number } = {
	2025: 1,
	2022: 16,
};

async function inicializar() {
	try {
		if (!(anio in certamenId)) {
			anio = 2025;
		}
		const res = await fetch(`${URL_EVENTOS}${certamenId[anio]}`);
		const evento = await res.json();

		const tematica = document.getElementById("tematica") as HTMLSpanElement;

		if (tematica) {
			tematica.textContent = evento.tematica.nombre;
		}

		await loadEscultores(escultor_por_evento, evento.id);
	} catch (error) {
		console.error("Error inicializando la página:", error);
	}
}
function Voto(correo: string, escultor_id: string) {
	document
		.getElementById(`votoForm-${escultor_id}`)
		?.addEventListener("submit", async (e) => {
			e.preventDefault();

			const formElement = e.target as HTMLFormElement;
			const button = formElement.querySelector(
				'button[type="submit"]',
			) as HTMLButtonElement;

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
							if (!button.classList.contains("active")) {
								button.classList.add("active");

								button.textContent = "";
								button.innerHTML += `
								 <dotlottie-player class="succesOperation" src="https://lottie.host/5e9375ca-af9f-4fff-8889-bba227a76782/yZOGBi0SfR.lottie" background="transparent" speed="1" style="width: 100px; height: 100px"  autoplay></dotlottie-player>`;
							}
							const data = await response.json();
							console.log("Rating enviado:", data);

							const contenedor = document.getElementById(
								`nombreOrigen-${escultor_id}`,
							);
							const califContainerShow = document.createElement("div");
							const btnVotarShow = document.querySelector(
								`.btn-votar[data-id="${escultor_id}"]`,
							) as HTMLButtonElement;

							califContainerShow.classList.add("calificacion");

							califContainerShow.innerHTML = `
								<p>${rating}</p>
								<i class="material-icons-outlined" id="certamen-tag-footer">&#xe838;</i>
							`;
							contenedor?.removeChild(btnVotarShow);
							contenedor?.appendChild(califContainerShow);
						} else {
							Toastify({
								text: "¡Error al enviar la calificación, usted ya voto a este escultor!",
								duration: 3000,
								gravity: "bottom",
								position: "right",
								style: {
									background: "#f63e3e",
								},
							}).showToast();
						}
					} catch (error) {
						console.error("Error al enviar rating:", error);
					}
				} else {
					Toastify({
						text: "Porfavor, seleccione un puntaje",
						duration: 3000,
						gravity: "bottom",
						position: "right",
						style: {
							background: "#f63e3e",
						},
					}).showToast();
				}
			}
		});
}

// ------ Get escultores ------

async function loadEscultores(url: string, evento_id: number) {
	try {
		const res = await fetch(`${url}?evento_id=${evento_id}`);
		const escultores = await res.json();
		const contenedor_escultores = document.querySelector(".grid-escultores");
		const totalEscultores = document.getElementById(
			"total-escultores",
		) as HTMLSpanElement;

		totalEscultores.textContent = escultores.length;

		if (contenedor_escultores) {
			for (const escultor of escultores) {
				let votado = false;
				let puntaje = 0;
				if (email) {
					try {
						const response = await fetch(
							`${check_puntaje}?correo=${email}&escultor_id=${escultor.id}`,
						);
						const result = await response.json();

						votado = result.votado;
						puntaje = result.puntaje;
					} catch (error) {
						console.log(`Error al chequear el mensaje: ${error}`);
					}
				}

				const article = document.createElement("article");

				article.classList.add("card-escultor");
				const foto = escultor.foto;
				const pais = escultor.pais.nombre;

				const NyA = escultor.nombre_completo;

				article.innerHTML = `
						
						<img
								src="${foto}"
								loading="lazy"
								alt="${NyA}"
								class="escultor-img" 
onerror="this.src='https://storage.cloud.google.com/bienaldelchaco/img/media/fondo.jpg'; this.onerror=null;"/>
						<div class="wrap-card">
							 <a href="detalle_escultor.html?id=${escultor.id}">Ver más</a>
							<div class="nombre-origen" id="nombreOrigen-${escultor.id}">
									<div class="space">
									<h3 id="nombre-escultor" >${NyA}</h3>
									</div>
									<p class="cursiva">${pais} </p>
									 ${
											votado
												? `<div class="calificacion">
												<p>${puntaje}</p>
												<i class="material-icons-outlined" id="certamen-tag-footer">&#xe838;</i>
												
											</div>`
												: `<button class="btn-votar" data-id="${escultor.id}">Votar</button>`
										}
							</div>
							
						</div>
						`;
				contenedor_escultores.appendChild(article);
			}

			// Agarro todos los botones de votar, y despues hago un for each para agregrarles a todos un eventlistener y usar el event.target para obtener el id del escultor que esta en un data-id en cada voton
			const botonesVotar = document.querySelectorAll(".btn-votar");

			const popupContainer = document.querySelector(
				".popUp-container",
			) as HTMLElement;

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

					if (email) {
						overlay.style.display = "block";
						popupContainer.style.display = "flex";
						const nombreEscultor = document.getElementById(
							"nombre-escultor",
						) as HTMLHeadElement;

						nombreEscultor.textContent =
							escultores[Number(id) - 1].nombre_completo;
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

if (window.location.pathname.includes("certamen")) {
	inicializar();
}
