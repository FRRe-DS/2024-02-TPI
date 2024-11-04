function loadHTML(file, elementId) {
  fetch(file)
    .then((response) => {
      if (!response.ok) throw new Error("Error al cargar el archivo");
      return response.text();
    })
    .then((data) => (document.getElementById(elementId).innerHTML = data))
    .catch((error) => console.error(error));
}

export function loadHeaderFooter() {
  loadHTML("header.html", "header");
  loadHTML("footer.html", "footer");
}
