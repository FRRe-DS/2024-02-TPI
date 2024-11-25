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



loadHTML("header.html", "header", "");