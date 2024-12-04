import { useEffect, useState } from "react";
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

import NuevoEventoPopup from "../components/crearEvento";
import EditarEventoPopup from "../components/editarEvento";
import { url } from "../utils";


declare module "@tanstack/react-table" {
    interface FilterFns {
        fuzzy: FilterFn<unknown>;
    }
    interface FilterMeta {
        itemRank: RankingInfo;
    }
}

type EventoAPI = {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    descripcion: string;
    lugar_id: number;
    tematica_id: number;
};

type Evento = {
    id: number;
    nombre: string;
    lugar: string;
    tematica: string;
    inicio: string;
    fin: string;
    descripcion: string;
};

type Lugar = {
    id: number;
    nombre: string;
    descripcion: string;
};

type Tematica = {
    id: number;
    nombre: string;
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
    if (columnId !== "nombre" && columnId !== "lugar" && columnId !== "tematica" && columnId !== "inicio") {
        return false;
    }
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
};

export default function Eventos() {
    const [data, _setData] = useState<Evento[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const handleOpenPopup = () => setIsPopupOpen(true);
    const handleClosePopup = () => {
        setIsPopupOpen(false)
        setIsPopupEditOpen(false)
    };

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
            header: () => "Descripción",
            cell: (info) => (
                <span title={info.getValue()}>{limitarPalabras(info.getValue(), 8)}</span>
            ),
            footer: (info) => info.column.id,
        }),
        columnHelper.display({
            id: "acciones",
            header: "Acciones",
            cell: (props) => {
                const openEditPopup = (id: number) => {
                    setEventoEditId(id);
                    setIsPopupEditOpen(true);
                };

                return (
                    <div className="acciones_container">
                        <button onClick={() => openEditPopup(props.row.original.id)}><i className="material-symbols-outlined">&#xe3c9;</i></button>

                    </div>
                );
            },
        }),
    ];

    const [isPopupEditOpen, setIsPopupEditOpen] = useState(false);
    const [eventoEditId, setEventoEditId] = useState<number | null>(null);

    async function fetchEventos() {
        try {
            const eventosResponse = await fetch(`${url}/eventos/`);
            const lugaresResponse = await fetch(`${url}/lugar/`);
            const tematicasResponse = await fetch(`${url}/tematica/`);

            if (
                eventosResponse.status !== 200 ||
                lugaresResponse.status !== 200 ||
                tematicasResponse.status !== 200
            ) {
                console.error("Error al obtener datos desde el backend");
                return;
            }

            const eventos: EventoAPI[] = await eventosResponse.json();
            const lugares: Lugar[] = await lugaresResponse.json();
            const tematicas: Tematica[] = await tematicasResponse.json();

            const lugarMap = new Map(lugares.map((lugar) => [lugar.id, lugar.nombre]));
            const tematicaMap = new Map(
                tematicas.map((tematica) => [tematica.id, tematica.nombre])
            );

            const transformedData: Evento[] = eventos.map((evento) => ({
                id: evento.id,
                nombre: evento.nombre,
                lugar: lugarMap.get(evento.lugar_id) || "Lugar no encontrado",
                tematica: tematicaMap.get(evento.tematica_id) || "Temática no encontrada",
                inicio: evento.fecha_inicio,
                fin: evento.fecha_fin,
                descripcion: evento.descripcion,
            }));

            const sortedData = transformedData.sort((a, b) => {
                return new Date(b.inicio).getTime() - new Date(a.inicio).getTime();
            });

            _setData(sortedData);

        } catch (error) {
            console.error("Error al procesar los datos", error);
        }
    }

    useEffect(() => {
        fetchEventos();
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
            <Menu paginaActual={"Eventos"} />
            <section className="mainSection">
                <header className="header-section">
                    <h1 className="header-title">Eventos</h1>
                    <button className="btn-principal" onClick={handleOpenPopup}>Nuevo evento</button>
                    <NuevoEventoPopup
                        isOpen={isPopupOpen}
                        onClose={handleClosePopup}
                        onNuevoEvento={fetchEventos} />
                    <EditarEventoPopup
                        isOpen={isPopupEditOpen && eventoEditId !== null}
                        onClose={handleClosePopup}
                        eventoId={eventoEditId}
                        onUpdate={fetchEventos} />
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
                            {/* <tfoot>
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
              </tfoot> */}
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
}
