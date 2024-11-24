export function setPaginaActual(pagina: string) {
	const paginas = ["inicio", "eventos", "certamen"];

	const indice = paginas.findIndex((el) => el.includes(pagina));

	const paginaActual = document.getElementById(
		`${paginas[indice]}-tag`,
	) as HTMLElement;

	if (paginaActual) {
		paginaActual.classList.add("paginaActual");
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

import { gsap } from "gsap";

const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

gsap.to("#wind", {
  strokeDashoffset: -60,
  repeat: -1,
  ease: "none",
  duration: 0.5,
});

tl.set("#lid", { transformOrigin: "center top" });
tl.set("#letter, #positive-mask", { transformOrigin: "center top" });

tl.fromTo(
  "#letter",
  { opacity: 0 },
  { opacity: 1, ease: "power4.out", duration: 0.5 },
  0
);

tl.fromTo(
  "#letter, #positive-mask",
  { scale: 2 },
  { scale: 1, ease: "power4.out", duration: 0.5 },
  0
);

tl.to("#letter, #positive-mask", {
  y: 250,
  duration: 1,
});

tl.fromTo(
  "#envelope, #negative-mask",
  { opacity: 0 },
  { opacity: 1, duration: 0.5 },
  0
);

tl.fromTo(
  "#envelope, #negative-mask",
  { y: 200 },
  { y: 0, ease: "power2.out", duration: 1 },
  0
);

tl.fromTo(
  "#lid",
  { scaleY: -1 },
  { scaleY: 1, duration: 0.5 },
  "-=0.4"
);

tl.to(
  "#wind, #envelope",
  { x: 40, ease: "power2.inOut", duration: 0.6 },
  "-=0.2"
);

tl.fromTo(
  "#wind",
  { opacity: 0 },
  { opacity: 1, duration: 0.3 },
  "-=0.4"
);

tl.to(
  "#wind, #envelope",
  { x: 60, opacity: 0, ease: "power2.in", duration: 0.3 },
  "+=2"
);
