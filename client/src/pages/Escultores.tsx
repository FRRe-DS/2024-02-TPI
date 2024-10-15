import { useState } from "react";
import Btn from "../components/btn";
import Search from "../components/search";
import Menu from "./menu/Menu";
import "./pages.css";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  FilterFn,
  getFilteredRowModel,
} from "@tanstack/react-table";
import Acciones from "../components/acciones";

declare module "@tanstack/react-table" {
  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

type Escultor = {
  nombre: string;
  nacionalidad: string;
  correo: string;
  imagen: string;
  bibliografia:string;
};

const defaultData: Escultor[] = [
  {
    nombre: "Cosme Fulanito",
    nacionalidad: "Argentina",
    correo: "cosme@corre.com",
    imagen: "../Camera.png",
    bibliografia: "asdadasdsa",
    },
  {
    nombre: "Pepe Perez",
    nacionalidad: "Argentina",
    correo: "pepe@correo.com",
    imagen: "../Camera.png",
    bibliografia: "asdadasdsa",
    },
];
const columnHelper = createColumnHelper<Escultor>();

const columns = [
  columnHelper.accessor("nombre", {
    header: () => "Nombre",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("nacionalidad", {
    header: () => "Nacionalidad",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("correo", {
    header: () => "Correo",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: (props) => <Acciones row={props.row} />,
  }),
];

export default function Escultores() {
  const [data, _setData] = useState(() => [...defaultData]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy", //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getCoreRowModel: getCoreRowModel(),
  });

return (
  <div className="mainContainer">
    <Menu paginaActual={"Escultores"} />
    <section className="mainSection">
      <header className="header-section">
        <h1 className="header-title">Escltores</h1>
        <Btn text="Nuevo escultor" />
      </header>
      <div className="section-container">
        <div className="action-btn__container">
          <Search
            text="Buscar por escultor o Nacionalidad"
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

