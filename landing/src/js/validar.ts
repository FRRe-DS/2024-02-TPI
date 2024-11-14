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

validar_qr();
