import { useState } from "react";
import Btn from "../components/btn";
import Filter from "../components/filter";
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
  getSortedRowModel,
} from "@tanstack/react-table";

import Acciones from "../components/acciones";

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({ itemRank });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

type Evento = {
  nombre: string;
  lugar: string;
  tematica: string;
  inicio: string;
  fin: string;
  descripcion: string;
};

const defaultData: Evento[] = [
  {
    nombre: "Bienal 2025",
    lugar: "Domo del centenario",
    tematica: "Madera",
    inicio: "02/10/2024",
    fin: "02/10/2024",
    descripcion: "Binela 2025 con temática de madera",
  },
  {
    nombre: "Bienal 2026",
    lugar: "Domo del centenario",
    tematica: "Hierro",
    inicio: "02/10/2025",
    fin: "02/10/2025",
    descripcion: "Binela 2026 con temática de hierro",
  },
];

const columnHelper = createColumnHelper<Evento>();

const columns = [
  columnHelper.accessor("nombre", {
    header: () => "Nombre",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("lugar", {
    header: () => "Lugar",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("tematica", {
    header: () => "Temática",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("inicio", {
    header: () => "Inicio",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("fin", {
    header: () => "Fin",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor("descripcion", {
    header: () => "Decripción",
    cell: (info) => info.renderValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.display({
    id: "acciones",
    header: "Acciones",
    cell: (props) => <Acciones row={props.row} />,
  }),
];

export default function Eventos() {
  const [data, _setData] = useState(() => [...defaultData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    // globalFilterFn: "fuzzy", //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
  });

  return (
    <div className="mainContainer">
      <Menu paginaActual={"Eventos"} />
      <section className="mainSection">
        <header className="header-section">
          <h1 className="header-title">Eventos</h1>
          <Btn text="Nuevo evento" />
        </header>
        <div className="section-container">
          <div className="action-btn__container">
            <Search text="Buscar por evento, lugar o temática" />
            <Filter text="Fecha" />
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
