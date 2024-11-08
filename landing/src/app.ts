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

function cerrarPopUp(): void {
  const overlay = document.querySelector(".overlay") as HTMLButtonElement;

  overlay.style.display = "none";
}

const votar = document.querySelector(".btn-votar") as HTMLButtonElement;

const cerrar_popup = document.querySelector(
  ".cerrar-popup"
) as HTMLButtonElement;

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
}

if (cerrar_popup) {
  cerrar_popup.addEventListener("click", cerrarPopUp);
}
