import Slider from "react-slick";
import { useState } from "react";
import { createColumnHelper, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import "./main.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
    nombre: "Baile arabe",
    lugar: "Domo del centenario",
    tematica: "Madera",
    inicio: "02/10/2024",
    fin: "02/10/2024",
    descripcion: "Binela 2025 con temática de madera",
  },
  {
    nombre: "Charla sobre tribus originarias",
    lugar: "Parque 2 de febrero",
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
];

export default function LandingPage() {
  const [data] = useState(() => [...defaultData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="landing-container">
      <header className="header">
        <div className="logo">
          <img src="../logo.png" alt="Logo bienal del Chaco" />
        </div>
      </header>

      <Slider {...settings} className="carousel">
        <div>
          <img src="https://via.placeholder.com/800x400" alt="Imagen 1" />
        </div>
        <div>
          <img src="https://via.placeholder.com/800x400" alt="Imagen 2" />
        </div>
        <div>
          <img src="https://via.placeholder.com/800x400" alt="Imagen 3" />
        </div>
      </Slider>

      <div className="table-container">
        <table className="sculpture-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header?.()}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{cell.renderValue()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}