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
import NuevoEscultorPopup from "../components/crearEscultor";
import EditarEscultorPopup from "../components/editarEscultor";
import { useNavigate } from "react-router-dom";
import { url } from "../utils";

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
    id: number
    nombre: string;
    nacionalidad: string;
    correo: string;
    foto: string;
    bibliografia: string;
};




export default function Escultores() {
    const columnHelper = createColumnHelper<Escultor>();
    const navigate = useNavigate();

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
            cell: (props) => {
                const openEditPopup = (id: number) => {
                    setEscultorEditId(id);
                    setIsPopupEditOpen(true);
                };

                return (
                    <div className="acciones_container">
                        <button onClick={() => openEditPopup(props.row.original.id)}><i className="material-symbols-outlined">&#xe3c9;</i></button>

                        <button onClick={() => navigate(`/ver-escultor/${props.row.original.id}`)}>
                            <i className="material-symbols-outlined">&#xe8f4;</i></button>
                    </div>
                );
            },
        }),
    ];
    const [escultorEditId, setEscultorEditId] = useState<number | null>(null);
    const [isPopupEditOpen, setIsPopupEditOpen] = useState(false);

    const [data, _setData] = useState<Escultor[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    async function fetch_escultores() {
        type EscultorResponse = {
            id: number,
            nombre: string,
            apellido: string,
            nombre_completo: string,
            correo: string,
            foto: string,
            bibliografia: string,
            fecha_nacimiento: string,
            esculturas: object[],
            eventos: object[],
            pais: {
                id: number,
                iso: string,
                nombre: string
            }
        };

    

        try {
            const response = await fetch(`${url}/escultores/`);
            if (!response.ok) {
                console.error(`Hubo un error al hacer el request a ${url}`);

                _setData([]);
                return;
            }

            const escultoresResponse: EscultorResponse[] = await response.json();

            const escultores: Escultor[] = escultoresResponse.map(escultorResp => ({
                id: escultorResp.id,
                nombre: escultorResp.nombre_completo,
                apellido: escultorResp.apellido,
                correo: escultorResp.correo,
                foto: escultorResp.foto,
                bibliografia: escultorResp.bibliografia,
                nacionalidad: escultorResp.pais?.nombre || "Desconocido",
            }));


            _setData(escultores);
        } catch (error) {
            console.error("Error al fetchear los escultores:", error);
            _setData([]);
        }
    }

    useEffect(() => {
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
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const handleOpenPopup = () => setIsPopupOpen(true);
    const handleClosePopup = () => {
        setIsPopupOpen(false)
        setIsPopupEditOpen(false)
    };

    return (
        <div className="mainContainer">
            <Menu paginaActual={"Escultores"} />
            <section className="mainSection">
                <header className="header-section">
                    <h1 className="header-title">Escultores</h1>
                    <button className="btn-principal" onClick={handleOpenPopup}>Nuevo escultor</button>
                    <NuevoEscultorPopup
                        isOpen={isPopupOpen}
                        onClose={handleClosePopup}
                        onNuevoEscultor={fetch_escultores} />
                    <EditarEscultorPopup
                        isOpen={isPopupEditOpen && escultorEditId !== null}
                        onClose={handleClosePopup}
                        escultorId={escultorEditId}
                        onUpdate={fetch_escultores} />
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
