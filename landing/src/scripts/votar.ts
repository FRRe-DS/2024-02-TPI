import { getNombreEscultor } from "./validar";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { getUrlParams } from "./utils";

const form = document.getElementById("ratingForm") as HTMLFormElement;
const button = document.querySelector(".btn-votarV2") as HTMLButtonElement;

function extractTimeStampFromULID(input: string): Date {
	const ulid_timestamp_str = input.slice(0, 10);
	const base32Chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
	let timestamp = 0;
	for (let i = 0; i < ulid_timestamp_str.length; i++) {
		timestamp = timestamp * 32 + base32Chars.indexOf(ulid_timestamp_str[i]);
	}
	return new Date(timestamp);
}

const TIME_LIMIT_MINS = 1.0;

function validar_qr(params: Record<string, string>) {
	const ulid_id = params.ulid;

	if (!ulid_id) {
		console.warn("No se encuentra el ulid id");
		return;
	}

	const timestamp = extractTimeStampFromULID(ulid_id);
	const now = new Date();
	const spanned = Math.abs(timestamp.getTime() - now.getTime()) / (1000 * 60);

	if (spanned < TIME_LIMIT_MINS) {
		console.log("Es válido!");
		console.log(spanned);
	} else {
		// TODO: Hacer que se muestre una pantalla de error como tengo en votar.html cuando ya se voto a un escultor
		console.error(`Es inválido!, el qr tiene un timestamp de ${timestamp}`);
		Toastify({
			text: "El qr ha caducado!",
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
}

if (form) {
	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const formElement = event.target as HTMLFormElement | null;

		const params = getUrlParams();
		const correo = params.correo;
		const escultor_id = params.escultor_id;

		if (!escultor_id || !correo) {
			Toastify({
				text: "Error inesperado, parámetros insuficientes",
				duration: 3000,
				gravity: "bottom",
				position: "right",
				style: {
					background: "#f63e3e",
				},
			}).showToast();

			window.location.href = "./certamen.html";
		}

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

						localStorage.setItem("userEmail", correo);
						setTimeout(() => {
							window.location.href = "./certamen.html";
						}, 3000);
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
						console.error("Error al enviar rating:", response.status);
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

if (window.location.pathname.includes("votar.html")) {
	const params = getUrlParams();

	validar_qr(params);
	getNombreEscultor(params.escultor_id);
}
