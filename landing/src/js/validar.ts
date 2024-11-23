import { formatearNombre, urlFotoEscultor } from "./certamen";
const URL_ESCULTORES = "http://localhost:8000/api/escultores/";

function extractTimeStampFromULID(input: string): Date {
	const ulid_timestamp_str = input.slice(0, 10);
	const base32Chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
	let timestamp = 0;
	for (let i = 0; i < ulid_timestamp_str.length; i++) {
		timestamp = timestamp * 32 + base32Chars.indexOf(ulid_timestamp_str[i]);
	}
	return new Date(timestamp);
}

export function getUrlParams(): Record<string, string> {
	const params = new URLSearchParams(window.location.search);
	const searchConfig: Record<string, string> = {};
	for (const [key, value] of params) {
		searchConfig[key] = value;
	}
	return searchConfig;
}

// const TIME_LIMIT_MINS = 0.5;
const TIME_LIMIT_MINS = 10.0;

async function getNombreEscultor(id: string, url: string) {
	try {
		const res = await fetch(`${url}${id}`);
		const escultor = await res.json();

		console.log(escultor);
		const nombreEscultor = document.getElementById(
			"nombre-escultor",
		) as HTMLHeadingElement;
		const fotoEscultor = document.getElementById(
			"img_escultor",
		) as HTMLImageElement;

		const nombre = formatearNombre(escultor.nombre, escultor.apellido);
		nombreEscultor.textContent = nombre;
		const foto = urlFotoEscultor(escultor.foto);
		fotoEscultor.src = foto;
		fotoEscultor.alt = nombre;
		fotoEscultor.title = nombre;
	} catch (error) {
		console.log(`Error al cargar el escultor: ${error}`);
	}
}

function validar_qr(params: Record<string, string>) {
	const ulid_id = params.id;

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
		console.error(`Es inválido!, el qr tiene un timestamp de ${timestamp}`);
		alert("Es inválido, el qr ha caducado!");
		window.location.href = "./certamen.html";
	}
}

async function validar_votante() {
	const stored_email = localStorage.getItem("userEmail");
	const params = getUrlParams();
	const escultor_id = params.id;
	if (!escultor_id) {
		alert("Error inesperado, el escultor_id es nulo");
		window.location.href = "./certamen.html";
	}

	if (stored_email) {
		// A esto le tendria que pasar el id del escultor
		window.location.href = `./votar.html?correo=${stored_email}&escultor_id=${escultor_id}`;
	} else {
		const email = (document.getElementById("email") as HTMLInputElement)?.value;

		if (!email) {
			alert("Error inesperado, el email es nulo");
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
				const data = await response.json();
				alert(data.mensaje);
			} else {
				console.error("Error al validar votante:", response.status);
			}
		} catch (error) {
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

		// Obtener la respuesta del CAPTCHA
		const turnstileResponse = window.turnstile?.getResponse();

		// Asegurarse de que el token de Turnstile esté presente
		if (!turnstileResponse) {
			alert("Por favor, completa el CAPTCHA.");
			return;
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
				alert(result.error || "CAPTCHA inválido.");
			}
		} catch (error) {
			console.error("Error al verificar el CAPTCHA:", error);
			alert("Ocurrió un error. Por favor, inténtalo nuevamente.");
		}
	});
}

const params = getUrlParams();
getNombreEscultor(params.id, URL_ESCULTORES);
// validar_qr(params);
