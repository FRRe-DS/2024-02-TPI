let lastScrollTop = 0;
const header = document.getElementById("header");

window.addEventListener("scroll", function () {
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (entry.target.classList.contains("hidden")) {
        entry.target.classList.add("show");
      } else if (entry.target.classList.contains("hiddenImg")) {
        entry.target.classList.add("showImg");
      }
    }
  });
});

const hiddenElements = document.querySelectorAll(".hidden");

const hiddenImgElements = document.querySelectorAll(".hiddenImg");

hiddenElements.forEach((el) => observer.observe(el));

hiddenImgElements.forEach((el) => observer.observe(el));
