import { loadHTML } from "../app";
import { loadPais } from "./certamen";
import { getUrlParams } from "./validar";

const URL_ESCULTORES = `${__API_URL__}/api/escultores/`;
const URL_ESCULTURAS = `${__API_URL__}/api/esculturas/`;

const URL_PAIS = `${__API_URL__}/api/paises/`;

const params = getUrlParams();


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

		// console.log(escultor)

		const nombreEscultor = document.querySelector("#nombre-escultor") as HTMLHeadingElement;
		const descripcionEscultor = document.querySelector("#descripcion-escultor") as HTMLParagraphElement;

    const descripcionEscultura = document.querySelector("#descripcion-escultura") as HTMLParagraphElement;
		const nombreEscultura = document.querySelector("#nombre-escultura") as HTMLHeadingElement;
  
    const imagenEvento = document.querySelector("#imagen-evento") as HTMLImageElement;

		const pais = document.querySelector("#pais") as HTMLElement

		nombreEscultor.textContent = escultor.nombre_completo
		
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
