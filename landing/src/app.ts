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

export function Voto() {
	document.getElementById("votoForm")?.addEventListener("submit", async (e) => {
		e?.preventDefault();

		const email = (document.getElementById("email") as HTMLInputElement)?.value;

		if (!email) {
			return;
		}

		type Response = {
			status: number;
			mensaje: string;
		};

		const formData = new FormData();
		formData.append("email", email);

		try {
			const response = await fetch(
				`http://localhost:8000/api/publicar_voto/?email=${email}`,
				{
					method: "POST",
					body: formData,
				},
			);

			if (response.status === 200) {
				const data: Response = await response.json();
				localStorage.setItem("userEmail", email);
				// TODO: Hacerlo mas lindo
				alert(`El voto se ha registrado de manera exitosa: ${data.mensaje}`);
			} else {
				const data: Response = await response.json();
				alert(`Ha ocurrido un fallo al registrar su voto:${data.mensaje}`);
			}
		} catch (error) {
			// TODO: No dejar que falle silenciosamente.
			console.error("Server error:", error);
		}
	});
}

loadHTML("header.html", "header");
loadHTML("footer.html", "footer");
