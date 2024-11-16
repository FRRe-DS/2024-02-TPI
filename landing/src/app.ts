function loadHTML(file: string, elementId: string): void {
	fetch(file)
		.then((response) => {
			if (!response.ok) throw Error("Error al cargar el archivo");
			return response.text();
		})
		.then((data) => {
			const element = document.getElementById(elementId);
			if (element) {
				element.innerHTML = data;
			} else {
				console.error(`Elemento con ID "${elementId}" no fue encontrado.`);
			}
		})
		.catch((error) => console.error(error));
}

loadHTML("header.html", "header");
loadHTML("footer.html", "footer");
