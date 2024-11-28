import { loadHTML } from "../app";
import { getUrlParams } from "./validar";

const volverAValidar = document.getElementById("volverAValidar") as HTMLLinkElement;
const params = getUrlParams();

if (params.escultor_id){
  if (volverAValidar){
	volverAValidar.href = `validar.html?id=${params.escultor_id}`
  }
}else{
  volverAValidar.href = "certamen.html"
}


if (window.location.pathname.includes("error.html")) {
  loadHTML("header.html", "header", "");
  loadHTML("footer.html", "footer", "");
}