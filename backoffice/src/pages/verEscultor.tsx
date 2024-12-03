import { useEffect, useState } from "react";
import Menu from "./menu/Menu";
import "./pages.css";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  FilterFn,
  getFilteredRowModel,
} from "@tanstack/react-table";

import NuevaEsculturaPopup from "../components/crearEscultura";
import EditarEsculturaPopup from "../components/editarEscultura";
import { useParams } from "react-router-dom";


const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  if (columnId !== "nombre" && columnId !== "nacionalidad" && columnId !== "escultor") {
    return false;
  }

  const itemRank = rankItem(String(row.getValue(columnId) ?? ""), value);
  addMeta({ itemRank });
  return itemRank.passed;
};



type Escultura = {
  id: number;
  nombre: string;
  escultor_id: string;
  fecha_creacion: string;
  descripcion: string;
};

function limitarPalabras(texto: string, max: number): string {
  const palabra = texto.split(" ");
  if (palabra.length > max) {
    return palabra.slice(0, max).join(" ") + "...";
  }
  return texto;
}



export default function Esculturas() {
  const columnHelper = createColumnHelper<Escultura>();
  const columns = [
 
  columnHelper.accessor("nombre", {
    header: () => "Nombre",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("descripcion", {
    header: () => "Descripción",
    cell: (info) => (
      <span title={info.getValue()}>{limitarPalabras(info.getValue(), 6)}</span>
    ),
    footer: (info) => info.column.id,
  }),
  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: (props) => {
      const openEditPopup = (id: number) => {
        setEsculturaEditId(id);
        setIsPopupEditOpen(true);
      };
  
  
      return (
        <div className="acciones_container">
          <button onClick={() => openEditPopup(props.row.original.id)}><i className="material-symbols-outlined">&#xe3c9;</i></button>
          <button onClick={() => console.log("")}><i className="material-symbols-outlined">&#xe8f4;</i></button>
        </div>
      );
    },
  }),
];


  const { id } = useParams();
  const [data, setData] = useState<Escultura[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const url = "http://localhost:8000/api";
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [isPopupEditOpen, setIsPopupEditOpen] = useState(false);
  
  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => {
    setIsPopupOpen(false)
    setIsPopupEditOpen(false)
  };

  type EscultorResponse = {
    id: number;
    nombre: string;
    apellido: string;
    nombre_completo: string;
    correo: string;
    foto: string;
    bibliografia: string;
    fecha_nacimiento: string;
    esculturas: object[];
    eventos: object[];
    pais: {
        id: number;
        iso: string;
        nombre: string;
    };
};

type Escultor = {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    foto: string;
    bibliografia: string;
    nacionalidad: string;
};
const [escultor, setEscultor] = useState<Escultor>();
  
  async function fetchEscultor() {
  
    try {
        const response = await fetch(`${url}/escultores/${id}/`); // Cambiado para obtener un solo escultor por su ID
        if (!response.ok) {
            throw new Error("Error al obtener el escultor");
        }

        const escultorResp: EscultorResponse = await response.json();

        const escultorData: Escultor = {
            id: escultorResp.id,
            nombre: escultorResp.nombre_completo,
            apellido: escultorResp.apellido,
            correo: escultorResp.correo,
            foto: escultorResp.foto,
            bibliografia: escultorResp.bibliografia,
            nacionalidad: escultorResp.pais?.nombre || "Desconocido",
        };

        setEscultor(escultorData);
    } catch (error) {
        console.error("Error al obtener el escultor:", error);
     
    }
}

function copiarQr(id:string | undefined) {

  const url = `https://elrincondelinge.org/qr/?id=${id}`;

  navigator.clipboard.writeText(url)
    .then(() => {
      alert("¡URL copiada al portapapeles!");
    })
    .catch((err) => {
      console.error("Error al copiar la URL al portapapeles", err);
    });
}


  const [esculturaEditId, setEsculturaEditId] = useState<number | null>(null); 

  async function fetchEsculturas() {
    try {
      const esculturasResponse = await fetch(`${url}/esculturas/?escultor_id=${id}`);
      if (esculturasResponse.status !== 200) {
        console.error("Error al obtener datos desde el backend");
        return;
      }
      const data = await esculturasResponse.json();
  
      setData(data);
    } catch (error) {
      console.error("Error al procesar los datos", error);
    }
  }

  useEffect(() => {
    fetchEsculturas();
    fetchEscultor()
  }, []);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy",
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="mainContainer">
      <Menu paginaActual={"Escultores"} />
      <section className="mainSection">
        <header className="header-section">
          <h1 className="header-title">Perfil del escultor</h1>
          <div className="buttons"> 
            <button className="btn cancelar" onClick={() => copiarQr(id)}>Copiar qr</button>
            <button className="btn-principal" onClick={handleOpenPopup}>Agregar escultura</button>
          </div>
         
          <NuevaEsculturaPopup 
            isOpen={isPopupOpen} 
            onClose={handleClosePopup} 
            onNuevoEscultura={fetchEsculturas} />
          <EditarEsculturaPopup
            isOpen={isPopupEditOpen && esculturaEditId !== null}
            onClose={handleClosePopup}
            esculturaId={esculturaEditId} 
            onUpdate={fetchEsculturas}/>
        </header>
        <div className="section-container">
          <div className="contenedor-info-escultor">
            <div className="center">

            <div className="info">
              <div className="group"><h2>{escultor?.nombre}</h2>
              <p>{escultor?.nacionalidad}</p></div>
              <div className="group"><h3>Bibliografía</h3>
              <p>{escultor?.bibliografia}</p></div>

            </div>
            </div>
           
            <img src={escultor?.foto} alt={escultor?.nombre} title={escultor?.nombre}/>
          </div>

          <h2 className="header-title">Obras realizadas</h2>
          <div className="table-container">
            <table className="event-table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>            
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}


