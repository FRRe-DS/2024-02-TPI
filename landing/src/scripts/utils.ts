export function getUrlParams(): Record<string, string> {
	const params = new URLSearchParams(window.location.search);
	const searchConfig: Record<string, string> = {};
	for (const [key, value] of params) {
		searchConfig[key] = value;
	}
	return searchConfig;
}

export function formatearFecha(fechaString: string) {
	const [year, month, day] = fechaString.split("-").map(Number);

	const fecha = new Date(year, month - 1, day);

	const opciones: Intl.DateTimeFormatOptions = {
		day: "2-digit",
		month: "short",
	};
	return fecha.toLocaleDateString("es-ES", opciones);
}
