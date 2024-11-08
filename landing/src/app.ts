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

export function redirectTo(url: string) {
  location.href = url;
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
        }
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

function Votar() {
  const votar = document.querySelector(".btn-votar") as HTMLElement;
  console.log(votar);

  if (votar) {
    votar.addEventListener("click", (event) => {
      event.preventDefault();
      const email = localStorage.getItem("userEmail");
      const escultor = document.querySelector(
        "#nombre-escultor"
      ) as HTMLHeadingElement;

      if (!email) {
      } else {
        window.location.href = `./votar.html?nombre-escultor=${escultor.textContent}`;
      }
    });
  } else {
    return;
  }
}

// ------ Votar ------
// Al hacer click en el btn votar en un esculotor verificamos primero si tenemos un mail en el localstorage, esto implica que ya se vito antes y quedo validado el mail, entonces solo le muestro un popup para votar, en caso contrario lo mando a la pantalla de validadr.html para validad su mail

const botonesVotar = document.querySelectorAll(
  ".btn-votar"
) as NodeListOf<HTMLButtonElement>;

const overlay = document.querySelector(".overlay") as HTMLButtonElement;
const popup = document.querySelector(".popUp-container") as HTMLDivElement;
const cerrar_popup = document.querySelector(
  ".cerrar-popup"
) as HTMLButtonElement;

function abrirPopUp(): void {
  overlay.style.display = "block";
  popup.style.display = "flex";
}

function cerrarPopUp(): void {
  overlay.style.display = "none";
  popup.style.display = "none";
}

for (const votar of botonesVotar) {
  if (votar) {
    votar.addEventListener("click", (event) => {
      event.preventDefault();
      const email = localStorage.getItem("userEmail");
      const escultor = document.querySelector(
        "#nombre-escultor"
      ) as HTMLHeadingElement;

      if (!email) {
        abrirPopUp();
      } else {
        window.location.href = `./votar.html?nombre-escultor=${escultor.textContent}`;
      }
    });
  }
}

if (cerrar_popup) {
  cerrar_popup.addEventListener("click", cerrarPopUp);
}
