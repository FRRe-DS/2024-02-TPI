import { useEffect, useState } from "react";
import Btn from "../components/btn";
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
import Acciones from "../components/acciones";
import DateFilter from "../components/dateFilter";

type EsculturaAPI = {
  id: number;
  escultor_id: number;
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
  qr: string | null;
};

type Escultor = {
  id: number;
  nombre: string;
  apellido: string;
  pais_id: number;
};

type Pais = {
  id: number;
  nombre: string;
};

type Escultura = {
  id: number;
  imagen: string;
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

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

const columnHelper = createColumnHelper<Escultura>();

const columns = [
  columnHelper.accessor("imagen", {
    header: () => "Imagen",
    cell: (info) => (
      <div style={{ width: "80px", height: "80px", overflow: "hidden" }}>
        <img
          src={info.getValue()}
          alt={info.row.original.nombre}
          className="imagen"
        />
      </div>
    ),
    footer: (info) => info.column.id,
  }),
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
    cell: (props) => <Acciones row={props.row} />,
  }),
];

export default function Esculturas() {
  const [data, setData] = useState<Escultura[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const url = "http://localhost:8000/api";

  useEffect(() => {
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
            { nombre: `${escultor.nombre} ${escultor.apellido}`, pais_id: escultor.pais_id },
          ])
        );
        const paisMap = new Map(paises.map((pais) => [pais.id, pais.nombre]));

        const transformedData: Escultura[] = esculturas.map((escultura) => {
          const escultor = escultorMap.get(escultura.escultor_id);
          const nacionalidad = escultor ? paisMap.get(escultor.pais_id) || "Nacionalidad desconocida" : "Desconocido";

          return {
            id: escultura.id,
            imagen: "../Camera.png", // Imagen por defecto
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
          <Btn text="Nueva escultura" />
        </header>
        <div className="section-container">
          <div className="action-btn__container">
            <Search
              text="Buscar por escultor o nacionalidad"
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
            />
            <DateFilter text="Fecha" />
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
              <tfoot>
                <tr>
                  <td colSpan={8} className="pagination">
                    <a href="#" className="page-link">
                      <span className="material-symbols-outlined">
                        keyboard_double_arrow_left
                      </span>
                    </a>
                    <a href="#" className="page-link">
                      <span className="material-symbols-outlined">
                        keyboard_arrow_left
                      </span>
                    </a>
                    <a href="#" className="page-link">
                      <span className="material-symbols-outlined">
                        keyboard_arrow_right
                      </span>
                    </a>
                    <a href="#" className="page-link">
                      <span className="material-symbols-outlined">
                        keyboard_double_arrow_right
                      </span>
                    </a>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
