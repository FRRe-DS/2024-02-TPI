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

function getUrlParams(): Record<string, string> {
	const params = new URLSearchParams(window.location.search);
	const searchConfig: Record<string, string> = {};
	for (const [key, value] of params) {
		searchConfig[key] = value;
	}
	return searchConfig;
}

const TIME_LIMIT_MINS = 0.5;
// const TIME_LIMIT_MINS = 10.0;

async function getNombreEscultor(id:string, url:string){
	try{
		
		const res = await fetch(`${url}${id}`);
		const escultor = await res.json();

		console.log(escultor)
		const nombreEscultor = document.getElementById("nombre-escultor") as HTMLHeadingElement
		const fotoEscultor = document.getElementById("img_escultor") as HTMLImageElement

		const nombre = formatearNombre(escultor.nombre, escultor.apellido);
		nombreEscultor.textContent = nombre;
		const foto = urlFotoEscultor(escultor.foto);
		fotoEscultor.src= foto
		fotoEscultor.alt= nombre
		fotoEscultor.title= nombre
		
	}catch(error){
		console.log(`Error al cargar el escultor: ${error}`)
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

async function Voto() {
		const stored_email = localStorage.getItem("userEmail");

		if (stored_email) {
			// A esto le tendria que pasar el id del escultor
			window.location.href = "./votar.html";
			
		} else {
			const params = getUrlParams();
			const escultor_id = params.id;

			if (!escultor_id) {
				alert("Error inesperado, el escultor_id es nulo");
				window.location.href = "./certamen.html";
			}

			const email = (document.getElementById("email") as HTMLInputElement)?.value;

			if (!email) {
				alert("Error inesperado, el email es nulo");
				window.location.href = "./certamen.html";
			}

			type Response = {
				status: number;
				error: string;
			};

			// tryhardeo el puntaje, el puntaje lo asigno despues de verificar el email
			const data = { escultor_id: escultor_id, puntaje: 5 };

			try {
				const response = await fetch(
					`http://localhost:8000/api/voto_escultor/?correo_votante=${email}`,
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
					localStorage.setItem("userEmail", email);
					alert(`El voto se ha registrado de manera exitosa: ${data.status}`);
					window.location.href = "./certamen.html";
				} else if (response.status === 202) {
					const data: Response = await response.json();
					alert(`${data.status}`);
				} else {
					const data: Response = await response.json();
					alert(`Ha ocurrido un fallo al registrar su voto:${data.error}`);
					window.location.href = "./certamen.html";
				}
			} catch (error) {
				console.error("Server error:", error);
			}
		}
	};


// Verificar el captcha
declare global {
  interface Window {
    turnstile: any; 
  }
}

const form = document.getElementById("votoForm");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();  // Prevenir el envío del formulario

    // Crear FormData a partir del formulario
    const formData = new FormData(this);
    
    // Obtener la respuesta del CAPTCHA
    const turnstileResponse = window.turnstile.getResponse();
    
    // Asegurarse de que el token de Turnstile esté presente
    if (!turnstileResponse) {
      alert("Por favor, completa el CAPTCHA.");
      return;
    }

    // Añadir el token de Turnstile al FormData
    formData.append("cf-turnstile-response", turnstileResponse);

    // Verificar el contenido de FormData (opcional, solo para depuración)
    console.log([...formData]);  // Esto mostrará todos los pares clave-valor del FormData

    try {
      const response = await fetch("http://localhost:8000/verify-captcha/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Resultado de verificación del CAPTCHA:", result);
      
      if (response.ok && result.success) {
        // Si el CAPTCHA es verificado correctamente
				Voto();
      } else {
        alert(result.error || "CAPTCHA inválido.");
      }
    } catch (error) {
      console.error("Error al verificar el CAPTCHA:", error);
      alert(`Ocurrió un error. Por favor, inténtalo nuevamente.`);
    }
  });
}

const params = getUrlParams();
getNombreEscultor(params.id, URL_ESCULTORES)
// validar_qr(params);


