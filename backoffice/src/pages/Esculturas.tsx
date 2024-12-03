import { useEffect, useState } from "react";
import Search from "../components/search";
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


const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  if (columnId !== "nombre" && columnId !== "nacionalidad" && columnId !== "escultor") {
    return false;
  }

  const itemRank = rankItem(String(row.getValue(columnId) ?? ""), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

type EsculturaAPI = {
  id: number;
  escultor_id: number;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
};

type Escultor = {
  id: number;
  nombre_completo: string;
  pais_id: number;
};

type Pais = {
  id: number;
  nombre: string;
};

type Escultura = {
  id: number;
  nombre: string;
  escultor: string;
  nacionalidad: string;
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
  columnHelper.accessor("escultor", {
    header: () => "Escultor",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("nacionalidad", {
    header: () => "Nacionalidad",
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


  const [esculturaEditId, setEsculturaEditId] = useState<number | null>(null); // ID para la escultura a editar

  async function fetchEsculturas() {
    try {
      const esculturasResponse = await fetch(`${url}/esculturas/`);
      const escultoresResponse = await fetch(`${url}/escultores/`);
      const paisesResponse = await fetch(`${url}/paises/`);

      if (
        esculturasResponse.status !== 200 ||
        escultoresResponse.status !== 200 ||
        paisesResponse.status !== 200
      ) {
        console.error("Error al obtener datos desde el backend");
        return;
      }

      const esculturas: EsculturaAPI[] = await esculturasResponse.json();
      const escultores: Escultor[] = await escultoresResponse.json();
      const paises: Pais[] = await paisesResponse.json();

      const escultorMap = new Map(
        escultores.map((escultor) => [
          escultor.id,
          { nombre: `${escultor.nombre_completo}`, pais_id: escultor.pais_id },
        ])
      );
      const paisMap = new Map(paises.map((pais) => [pais.id, pais.nombre]));

      const transformedData: Escultura[] = esculturas.map((escultura) => {
        const escultor = escultorMap.get(escultura.escultor_id);
        const nacionalidad = escultor
          ? paisMap.get(escultor.pais_id) || "Nacionalidad desconocida"
          : "Desconocido";
      
        return {
          id: escultura.id,
          nombre: escultura.nombre,
          escultor: escultor ? escultor.nombre : "Desconocido",
          nacionalidad: nacionalidad,
          descripcion: escultura.descripcion,
        };
      });

      setData(transformedData);
    } catch (error) {
      console.error("Error al procesar los datos", error);
    }
  }

  useEffect(() => {
    fetchEsculturas();
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
      <Menu paginaActual={"Esculturas"} />
      <section className="mainSection">
        <header className="header-section">
          <h1 className="header-title">Esculturas</h1>
          <button className="btn-principal" onClick={handleOpenPopup}>Nueva escultura</button>
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
          <div className="action-btn__container">
            <Search
              text="Buscar"
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
            />
           
          </div>
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


