import { getUrlParams } from "./validar";

const form = document.getElementById("ratingForm");

if (form) {
	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const formElement = event.target as HTMLFormElement | null;

		const params = getUrlParams();
		const correo = params.correo;
		const escultor_id = params.escultor_id;

		if (!escultor_id || !correo) {
			alert("Error inesperado, parametros insuficientes");
			window.location.href = "./certamen.html";
		}

		if (formElement) {
			const formData = new FormData(formElement);
			const rating = formData.get("rating");

			if (rating) {
				try {
					const response = await fetch(
						"http://localhost:8000/api/voto_escultor/",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								puntaje: rating,
								escultor_id: escultor_id,
								correo_votante: correo,
							}),
						},
					);

					if (response.ok) {
						const data = await response.json();
						console.log("Rating enviado:", data);
						alert("¡Gracias por tu calificación!");
						localStorage.setItem("userEmail", correo);
						window.location.href = "./certamen.html";
					} else {
						console.error("Error al enviar rating:", response.status);
					}
				} catch (error) {
					console.error("Error al enviar rating:", error);
				}
			} else {
				alert("Por favor, selecciona una calificación.");
			}
		}
	});
}
