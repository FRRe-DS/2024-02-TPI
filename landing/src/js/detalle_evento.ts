
import { formatearFecha } from "../app";

const URL_EVENTOS = "http://localhost:8000/api/eventos/";
const URL_LUGAR= "http://localhost:8000/api/lugar/";
const URL_MATERIAL= "http://localhost:8000/api/tematica/";

async function loadLugar(URL:string, id:string){
  try{
    const res = await fetch(`${URL}${id}`)
    const lugar = await res.json() 
   
    return lugar
   
  }catch(error){
    console.log(`Error al carga el lugar: ${error}`);
  }
  
}


async function loadTematica(URL:string, id:string){
  try{
    const res = await fetch(`${URL}${id}`)
    const tematica = await res.json() 
    console.log(tematica)
    return tematica
   
  }catch(error){
    console.log(`Error al carga la tematica: ${error}`);
  }
  
}

async function loadEvento(URL:string, id:string) {
  try{
    const res = await fetch(`${URL}${id}`)
    const evento = await res.json() 

    const titulo = document.querySelector("#nombre-evento") as HTMLHeadingElement
    const fecha = document.querySelector("#fecha-evento") as HTMLHeadingElement
    const descripcion = document.querySelector("#descripcion-evento") as HTMLParagraphElement
    const lugarNombre = document.querySelector("#lugar-evento") as HTMLSpanElement
    const lugarDescripcion = document.querySelector("#lugar-descripcion") as HTMLSpanElement
    const lugar = await loadLugar(URL_LUGAR, evento.lugar_id) 
    const tematicaNombre = document.querySelector("#evento-tematica") as HTMLSpanElement
    const tematicaDescripcion = document.querySelector("#evento-descripcion") as HTMLSpanElement
   
    const tematica = await loadTematica(URL_MATERIAL, evento.tematica_id) 

    
    titulo.textContent = evento.nombre
    fecha.textContent = `${formatearFecha(evento.fecha_inicio)} - ${formatearFecha(evento.fecha_fin)}`
    descripcion.textContent = evento.descripcion
    lugarNombre.textContent = lugar.nombre
    lugarDescripcion.textContent = lugar.descripcion
    tematicaNombre.textContent = tematica.nombre
    tematicaDescripcion.textContent = tematica.descripcion

    console.log(evento)
  }catch(error){
    console.log(`Error al carga el evento: ${error}`);
  }
  
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id") as string;

loadEvento(URL_EVENTOS, id)


