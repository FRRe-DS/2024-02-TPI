import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { loadHTML } from "../app";

export function getUrlParams(): Record<string, string> {
	const params = new URLSearchParams(window.location.search);
	const searchConfig: Record<string, string> = {};
	for (const [key, value] of params) {
		searchConfig[key] = value;
	}
	return searchConfig;
}

export async function getNombreEscultor(id: string) {
	const url = "http://localhost:8000/api/escultores/";
	try {
		const res = await fetch(`${url}${id}`);
		const escultor = await res.json();

		const nombreEscultor = document.getElementById(
			"nombre-escultor",
		) as HTMLHeadingElement;
		const fotoEscultor = document.getElementById(
			"img_escultor",
		) as HTMLImageElement;

		const nombre = escultor.nombre_completo;
		nombreEscultor.textContent = nombre;
		const foto = escultor.foto;
		fotoEscultor.src = foto;
		fotoEscultor.alt = nombre;
		fotoEscultor.title = nombre;
	} catch (error) {
		console.log(`Error al cargar el escultor: ${error}`);
	}
}

function notificarEmail() {
	const formularioVoto = document.querySelector(
		"#formulario-voto",
	) as HTMLElement;
	const imgEscultor = document.querySelector("#img_escultor") as HTMLElement;
	const notificarMail = document.querySelector("#notificarMail") as HTMLElement;
	const containerVotar = document.querySelector(
		".container-votar",
	) as HTMLElement;

	containerVotar.style.display = "block";
	containerVotar.style.width = "auto";
	containerVotar.style.paddingBlock = "32px 46px";
	containerVotar.style.paddingInline = "32px";

	formularioVoto.style.display = "none";

	imgEscultor.style.display = "none";
	notificarMail.style.display = "flex";
}

async function validar_votante() {
	const stored_email = localStorage.getItem("userEmail");
	const params = getUrlParams();
	const escultor_id = params.id;
	if (!escultor_id) {
		Toastify({
			text: "Error inesperado, el escultor_id es nulo",
			duration: 3000,
			gravity: "bottom",
			position: "right",
			style: {
				background: "#f63e3e",
			},
		}).showToast();

		window.location.href = "./certamen.html";
	}

	if (stored_email) {
		window.location.href = `./votar.html?correo=${stored_email}&escultor_id=${escultor_id}`;
	} else {
		const email = (document.getElementById("email") as HTMLInputElement)?.value;

		if (!email) {
			Toastify({
				text: "Error inesperado, el correo es nulo",
				duration: 3000,
				gravity: "bottom",
				position: "right",
				style: {
					background: "#f63e3e",
				},
			}).showToast();

			window.location.href = "./certamen.html";
		}

		try {
			const response = await fetch(
				// Le tengo que pasar el id escultor ya que cuando se valide quiero que me redirija a votar.html y necesito el id del escultor que iba a votar.
				`http://localhost:8000/validar_votante/?correo=${email}&escultor_id=${escultor_id}`,

				{
					method: "GET",
					headers: {
						Accept: "application/json",
					},
				},
			);

			if (response.status === 200) {
				window.location.href = response.url;
			} else if (response.status === 201) {
				// await response.json();
				notificarEmail();
				console.log("Envio exitoso");
			} else {
				Toastify({
					text: "Error al validar votante",
					duration: 3000,
					gravity: "bottom",
					position: "right",
					style: {
						background: "#f63e3e",
					},
				}).showToast();

				console.error("Error al validar votante:", response.status);
			}
		} catch (error) {
			Toastify({
				text: "Error de servidor",
				duration: 3000,
				gravity: "bottom",
				position: "right",
				style: {
					background: "#f63e3e",
				},
			}).showToast();
			console.error("Server error:", error);
		}
	}
}

// Verificar el captcha
declare global {
	interface Window {
		turnstile: any;
	}
}

const form = document.getElementById("votoForm");

if (form) {
	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const formData = new FormData(event.target as HTMLFormElement);

		const button = document.querySelector(".btn-enviar-email");

		// Obtener la respuesta del CAPTCHA
		const turnstileResponse = window.turnstile?.getResponse();

		// Asegurarse de que el token de Turnstile esté presente
		if (!turnstileResponse) {
			Toastify({
				text: "Por favor, completa el CAPTCHA.",
				duration: 3000,
				gravity: "bottom",
				position: "right",
				style: {
					background: "#f63e3e",
				},
			}).showToast();

			return;
		}
		if (button) {
			button.classList.toggle("active");
		}
		// Añadir el token de Turnstile al FormData
		formData.append("cf-turnstile-response", turnstileResponse);

		try {
			const response = await fetch("http://localhost:8000/verify-captcha/", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (response.ok && result.success) {
				// Si el CAPTCHA es verificado correctamente tengo que validar si el votante tiene su mail registrado
				// si no lo tiene lo debo crear
				validar_votante();
				// Luego lo redirecciono a votar.html ahi se ejecuta voto()
			} else {
				Toastify({
					text: "CAPTCHA inválido.",
					duration: 3000,
					gravity: "bottom",
					position: "right",
					style: {
						background: "#f63e3e",
					},
				}).showToast();
			}
		} catch (error) {
			console.error("Error al verificar el CAPTCHA:", error);
			Toastify({
				text: "Ocurrió un error. Por favor, inténtalo nuevamente.",
				duration: 3000,
				gravity: "bottom",
				position: "right",
				style: {
					background: "#f63e3e",
				},
			}).showToast();
		}
	});
}

const volverAValidar = document.getElementById(
	"volverAValidar",
) as HTMLLinkElement;
const params = getUrlParams();

if (volverAValidar) {
	volverAValidar.href = `validar.html?id=${params.id}`;
}

if (window.location.pathname.includes("validar.html")) {
	loadHTML("header.html", "header", "");
	loadHTML("footer.html", "footer", "");
	getNombreEscultor(params.id);
}
