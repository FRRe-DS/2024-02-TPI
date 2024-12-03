const URL_EVENTOS = `${__API_URL__}/api`;
const urlParams = new URLSearchParams(window.location.search);
const escultorId = urlParams.get('id'); 

if (escultorId) {
  const qrUrl = `${URL_EVENTOS}/generar_qr/?escultor_id=${escultorId}`;

  const setQr = document.getElementById("qr") as HTMLImageElement
  setQr.src = qrUrl
} else {
  console.error("No se proporcionó el id del escultor.");
}
