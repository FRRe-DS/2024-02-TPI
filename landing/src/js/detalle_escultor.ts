import { loadHTML } from "../app";
import { loadPais } from "./certamen";
import { getUrlParams } from "./validar";

const URL_ESCULTORES = `${__API_URL__}/api/escultores/`;
const URL_ESCULTURAS = `${__API_URL__}/api/esculturas/`;
const URL_PAIS = `${__API_URL__}/api/paises/`;
const URL_escultor_evento = `${__API_URL__}/api/escultor_evento/`;
const URL_EVENTOS = `${__API_URL__}/api/eventos/`;


const email = localStorage.getItem("userEmail");
const params = getUrlParams();

const form = document.querySelector(".formulario-voto") as HTMLElement;

const btnVotar = document.querySelector("#btnVotar") as HTMLLinkElement;
btnVotar.href = `./validar.html?id=${params.id}`

if (email) {
	btnVotar.style.display = "none"
}else{
	form.style.display = "none"
}

async function inicializar() {
	const loadingIndicator = document.getElementById("loading-indicator")!;
  const mainContent = document.querySelector(".section-certamen") as HTMLElement;
	const dividers = document.querySelectorAll(".divider-sm");
	const galeria = document.querySelector(".galeria") as HTMLElement;
	

	try {
		loadingIndicator.style.display = "flex";
    mainContent.style.display = "none";

		const res = await fetch(`${URL_ESCULTORES}${params.id}`)
		const escultor = await res.json()

		const res2 = await fetch(`${URL_ESCULTURAS}${escultor.esculturas[0].id}`)
		const escultura = await res2.json()

		const res3 = await fetch(`${URL_escultor_evento}${escultor.esculturas[0].id}`)
		const escultor_evento = await res3.json()

		const res4 = await fetch(`${URL_EVENTOS}${escultor_evento.evento_id}`)
		const evento = await res4.json()

	

		// console.log(escultor)

		const nombreEscultor = document.querySelectorAll("#nombre-escultor");
		const descripcionEscultor = document.querySelector("#descripcion-escultor") as HTMLParagraphElement;

    const descripcionEscultura = document.querySelector("#descripcion-escultura") as HTMLParagraphElement;
		const nombreEscultura = document.querySelector("#nombre-escultura") as HTMLHeadingElement;
  
    const imagenEvento = document.querySelector("#imagen-evento") as HTMLImageElement;

		const pais = document.querySelector("#pais") as HTMLElement

		const nombreEvento = document.querySelector("#nombre-evento") as HTMLElement;


		nombreEvento.textContent = evento.nombre

		for (const nombre of nombreEscultor) {
			nombre.textContent = escultor.nombre_completo
		}
		
		
		pais.textContent = (await loadPais(URL_PAIS, escultor.pais_id)).nombre

		descripcionEscultor.textContent = escultor.bibliografia
		nombreEscultura.textContent = escultura.nombre
		descripcionEscultura.textContent = escultura.descripcion

    imagenEvento.src = escultor.foto;
    imagenEvento.loading = "lazy";
    imagenEvento.title = escultor.nombre;

  
    imagenEvento.onerror = function () {
      this.src = "https://storage.cloud.google.com/bienaldelchaco/img/media/fondo.jpg";
      this.onerror = null;
    };

		for (const imagen of escultura.imagenes) {
			const article = document.createElement("article");

			// article.classList.add("card-escultor");

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

inicializar() 
loadHTML("header.html", "header", "certamen");
