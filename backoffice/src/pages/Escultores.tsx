import { useEffect, useState } from "react";
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
    interface FilterFns {
        fuzzy: FilterFn<unknown>;
    }
    interface FilterMeta {
        itemRank: RankingInfo;
    }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);

    addMeta({ itemRank });

    return itemRank.passed;
};

type Escultor = {
    nombre: string;
    nacionalidad: string;
    correo: string;
    foto: string;
    bibliografia: string;
};

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
        cell: (props) => <Acciones row={props.row} tipo="escultor" />,    }),
];

export default function Escultores() {
    const [data, _setData] = useState<Escultor[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const url = "http://localhost:8000/api";

    useEffect(() => {
        async function fetch_escultores() {
            type EscultorResponse = {
                id: number,
                nombre: string,
                correo: string,
                foto: string,
                bibliografia: string,
                pais_id: number
            };

            type PaisResponse = {
                id: number,
                nombre: string,
            };

            const response = await fetch(`${url}/escultores/`);
            if (response.status != 200) {
                console.error(`Hubo un error al hacer el request a ${url}`);
                console.table(response);
                _setData([]);
                return;
            }

            const intermedio_escultor: EscultorResponse[] = await response.json();

            const pais_promises = intermedio_escultor.map(async (escultor_resp) => {
                const response = await fetch(`${url}/paises/${escultor_resp.pais_id}`);
                if (response.status != 200) {
                    console.error(`Hubo un error al hacer el request a ${url}`);
                    const escultor = { nombre: escultor_resp.nombre, nacionalidad: "Desconocido", correo: escultor_resp.correo, foto: escultor_resp.foto, bibliografia: escultor_resp.bibliografia }
                    return escultor
                }

                const pais: PaisResponse = await response.json();

                const escultor: Escultor = { nombre: escultor_resp.nombre, nacionalidad: pais.nombre, correo: escultor_resp.correo, foto: escultor_resp.foto, bibliografia: escultor_resp.bibliografia }
                return escultor
            });

            const escultores: Escultor[] = await Promise.all(pais_promises);
            console.table(escultores);
            _setData(escultores);
        }
        fetch_escultores();
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
                    <h1 className="header-title">Escultores</h1>
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
