import { API_URL } from "astro:env/client";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { getUrlParams } from "./utils";

const URL_ESCULTORES = `${API_URL}/api/escultores/`;
const check_puntaje = `${API_URL}/api/check_puntaje`;

const email = localStorage.getItem("userEmail");
const params = getUrlParams();

const formContainer = document.querySelector(".formulario-voto") as HTMLElement;

const btnVotar = document.querySelector("#btnVotar") as HTMLLinkElement;
btnVotar.href = `./validar.html?id=${params.id}`;

if (email) {
	btnVotar.style.display = "none";
} else {
	formContainer.style.display = "none";
}

async function inicializar() {
	const loadingIndicator = document.getElementById("loading-indicator");

	if (!loadingIndicator) {
		throw Error("No se encuentra el elemento Loading indicator.");
	}

	const mainContent = document.querySelector(
		".section-certamen",
	) as HTMLElement;
	const dividers = document.querySelectorAll(".divider-sm");
	const galeria = document.querySelector(".galeria") as HTMLElement;

	try {
		loadingIndicator.style.display = "flex";
		mainContent.style.display = "none";

		const res = await fetch(`${URL_ESCULTORES}${params.id}`);
		const escultor = await res.json();

		const escultura = escultor.esculturas[0];
		const evento = escultor.eventos[0].evento;

		const nombreEscultor = document.querySelectorAll("#nombre-escultor");
		const descripcionEscultor = document.querySelector(
			"#descripcion-escultor",
		) as HTMLParagraphElement;

		const descripcionEscultura = document.querySelector(
			"#descripcion-escultura",
		) as HTMLParagraphElement;
		const nombreEscultura = document.querySelector(
			"#nombre-escultura",
		) as HTMLHeadingElement;

		const imagenEvento = document.querySelector(
			"#imagen-evento",
		) as HTMLImageElement;

		const pais = document.querySelector("#pais") as HTMLElement;

		const nombreEvento = document.querySelector(
			"#nombre-evento",
		) as HTMLElement;

		nombreEvento.textContent = evento.nombre;

		for (const nombre of nombreEscultor) {
			nombre.textContent = escultor.nombre_completo;
		}

		pais.textContent = escultor.pais.nombre;

		descripcionEscultor.textContent = escultor.bibliografia;
		nombreEscultura.textContent = escultura.nombre;
		descripcionEscultura.textContent = escultura.descripcion;

		imagenEvento.src = escultor.foto;
		imagenEvento.loading = "lazy";
		imagenEvento.title = escultor.nombre;

		imagenEvento.onerror = function () {
			this.src =
				"https://storage.cloud.google.com/bienaldelchaco/img/media/fondo.jpg";
			this.onerror = null;
		};

		for (const imagen of escultura.imagenes) {
			const article = document.createElement("article");

			article.innerHTML = `					
					<img
							src="${imagen.imagen}"
							loading="lazy"
						/>
					`;
			galeria.appendChild(article);
		}
	} catch (error) {
		console.error("Error inicializando la página:", error);
	} finally {
		loadingIndicator.style.display = "none";
		mainContent.style.display = "flex";
		dividers.forEach((divider) => {
			(divider as HTMLElement).style.display = "block";
		});
	}
}

const showCalificacion = document.getElementById(
	"showCalificacion",
) as HTMLElement;
const showVotarForm = document.getElementById("showVotarForm") as HTMLElement;
const calificacion = document.getElementById("showPuntaje") as HTMLElement;

if (email) {
	try {
		const response = await fetch(
			`${check_puntaje}?correo=${email}&escultor_id=${params.id}`,
		);
		const result = await response.json();

		if (result.votado) {
			showCalificacion.style.display = "grid";
			showVotarForm.style.display = "none";

			for (let i = 0; i < result.puntaje; i++) {
				const icon = document.createElement("i");
				icon.classList.add("material-icons-outlined");
				icon.id = "certamen-tag-footer";
				icon.innerHTML = "&#xe838;";

				calificacion.appendChild(icon);
			}
		}
	} catch (error) {
		console.log(`Error al chequear el mensaje: ${error}`);
	}
}

const form = document.getElementById("ratingForm") as HTMLFormElement;
if (form) {
	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const formElement = event.target as HTMLFormElement | null;

		const params = getUrlParams();
		const correo = email;
		const escultor_id = params.id;

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

						showCalificacion.style.display = "grid";
						showVotarForm.style.display = "none";

						for (let i = 0; i < Number(rating); i++) {
							const icon = document.createElement("i");
							icon.classList.add("material-icons-outlined");
							icon.id = "certamen-tag-footer";
							icon.innerHTML = "&#xe838;";

							calificacion.appendChild(icon);
						}
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
						setTimeout(() => {
							window.location.href = "./certamen.html";
						}, 3000);
					}
				} catch (error) {
					Toastify({
						text: "¡Error al enviar la calificación, vuelva a intentarlo más tarde!",
						duration: 3000,
						gravity: "bottom",
						position: "right",
						style: {
							background: "#f63e3e",
						},
					}).showToast();
					console.error("Error al enviar rating:", error);
				}
			} else {
				Toastify({
					text: "Por favor, seleccione una calificación",
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

inicializar();
