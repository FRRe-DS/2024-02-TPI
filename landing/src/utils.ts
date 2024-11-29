export function setPaginaActual(pagina: string) {
	const paginas = ["inicio", "eventos", "certamen"];

	const indice = paginas.findIndex((el) => el.includes(pagina));

	const paginaActual = document.getElementById(
		`${paginas[indice]}-tag`,
	) as HTMLElement;

	const paginaActualFooter = document.getElementById(
		`${paginas[indice]}-tag-footer`,
	) as HTMLElement;

	if (paginaActual) {
		paginaActual.classList.add("paginaActual");
	}
	if (paginaActualFooter) {
		paginaActualFooter.classList.remove("material-icons-outlined");
		paginaActualFooter.classList.add("material-icons");
	}
}

let lastScrollTop = 0;
const header = document.getElementById("header");

if (header) {
	window.addEventListener("scroll", () => {
		const scrollTop =
			document.documentElement.scrollTop || document.body.scrollTop;

		if (scrollTop === 0) {
			// Mostrar el header cuando está en la parte superior de la página
			header.classList.remove("hidden");
		} else if (scrollTop > lastScrollTop) {
			// Ocultar el header cuando se desplaza hacia abajo
			header.classList.add("hidden");
		} else if (scrollTop < lastScrollTop) {
			// Mostrar el header cuando se desplaza hacia arriba
			header.classList.remove("hidden");
		}

		// Actualizar la última posición de scroll
		lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
	});
}

const observer = new IntersectionObserver((entries) => {
	for (const entry of entries) {
		if (entry.isIntersecting) {
			if (entry.target.classList.contains("hidden")) {
				entry.target.classList.add("show");
			} else if (entry.target.classList.contains("hiddenImg")) {
				entry.target.classList.add("showImg");
			}
		}
	}
});
const hiddenElements = document.querySelectorAll(".hidden");
const hiddenImgElements = document.querySelectorAll(".hiddenImg");
for (const element of hiddenElements) {
	observer.observe(element);
}

for (const image of hiddenImgElements) {
	observer.observe(image);
}
