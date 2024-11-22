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

function validar_qr() {
	const params = getUrlParams();
	console.table(params);
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

function Voto() {
	document.getElementById("votoForm")?.addEventListener("submit", async (e) => {
		e?.preventDefault();

		const stored_email = localStorage.getItem("userEmail");

		if (stored_email) {
			// Mostrar el popup para que puntúe, obtener el valor y hacer el POST?
		} else {
			const params = getUrlParams();
			const escultor_id = params.escultor_id;

			if (!escultor_id) {
				alert("Error inesperado, el escultor_id es nulo");
				window.location.href = "./certamen.html";
			}

			const email = (document.getElementById("email") as HTMLInputElement)
				?.value;
			console.log(email);

			if (!email) {
				alert("Error inesperado, el email es nulo");
				window.location.href = "./certamen.html";
			}

			type Response = {
				status: number;
				error: string;
			};

			const data = { escultor_id: escultor_id, puntaje: 5 };

			try {
				const response = await fetch(
					`${__API_URL__}/api/voto_escultor/?correo_votante=${email}`,
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
	});
}

validar_qr();
Voto();
