import { getNombreEscultor, getUrlParams } from "./validar";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import { loadHTML } from "../app";


const form = document.getElementById("ratingForm") as HTMLFormElement;
const button = document.querySelector(".btn-votarV2") as HTMLButtonElement;



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
							
							button.textContent = ""
							button.innerHTML += `
							 <dotlottie-player class="succesOperation" src="https://lottie.host/5e9375ca-af9f-4fff-8889-bba227a76782/yZOGBi0SfR.lottie" background="transparent" speed="1" style="width: 100px; height: 100px"  autoplay></dotlottie-player>`
						
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
	loadHTML("header.html", "header", "");
	const params = getUrlParams();
	getNombreEscultor(params.escultor_id)
}