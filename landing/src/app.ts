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

export function loadHeaderFooter(): void {
	loadHTML("header.html", "header");
	loadHTML("footer.html", "footer");
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

export function Votar() {
	const votar = document.getElementById("votar-tag");

	if (votar) {
		votar.addEventListener("click", (event) => {
			event.preventDefault();
			const email = localStorage.getItem("userEmail");
			const escultor = document.getElementById(
				"nombre-escultor",
			) as HTMLHeadingElement;

			if (!email) {
				window.location.href = `./validar.html?nombre-escultor=${escultor.textContent}`;
			}
		});
	} else {
		return;
	}
}

function extractTimeStampFromULID(input: string): Date {
	const ulid_timestamp_str = input.slice(0, 10);
	const base32Chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
	let timestamp = 0;

	for (let i = 0; i < ulid_timestamp_str.length; i++) {
		timestamp = timestamp * 32 + base32Chars.indexOf(ulid_timestamp_str[i]);
	}

	return new Date(timestamp);
}

export function validar() {
	const params = getUrlParams();
	console.table(params);
	const ulid_id = params.id;
	if (!ulid_id) {
		console.error("No se encuentra el ulid id");
		return;
	}

	const timestamp = extractTimeStampFromULID(ulid_id);
	const now = new Date();
	const spanned = Math.min(timestamp.getTime() - now.getTime()) / (1000 * 60);

	if (spanned < 2) {
		console.log("Es válido!");
		alert("Es válido!");
	} else {
		console.error(`Es inválido!, el qr tiene un timestamp de ${timestamp}`);
		alert("Es inválido!");
	}
}

function getUrlParams(): Record<string, string> {
	const params = new URLSearchParams(window.location.search);
	const searchConfig: Record<string, string> = {};

	for (const [key, value] of params) {
		searchConfig[key] = value;
	}

	return searchConfig;
}
