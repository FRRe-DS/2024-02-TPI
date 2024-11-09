// ------ Get eventos ------
const URL_EVENTOS = "http://localhost:8000/api/eventos/";

async function loadEventos(url: string) {
  try {
    const res = await fetch(url);
    const data = res.json();
    console.log(data);
  } catch (error) {
    console.log(`Error al carga los eventos: ${error}`);
  }
}

loadEventos(URL_EVENTOS);

// function loadEventos(file: string) {
//   fetch(file)
//     .then((response) => {
//       if (!response.ok) throw Error("Error al cargar el archivo");
//       return response.text();
//     })
//     .then((data) => {
//       const element = document.getElementById(elementId);
//       if (element) {
//         element.innerHTML = data;
//       } else {
//         console.error(`Elemento con ID "${elementId}" no fue encontrado.`);
//       }
//     })
//     .catch((error) => console.error(error));
// }

// <div
// class="mosaico-card-evento hiddenImg"
// style="background-image: url(./images/escultor.jpeg)">
// <div class="descripcion-evento">
//   <h3>Artes escenicas</h3>
//   <div>
//     <i class="material-icons-outlined">&#xebcc;</i>
//     <p>1 de Julio - 10 de Julio</p>
//   </div>
// </div>
// </div>
