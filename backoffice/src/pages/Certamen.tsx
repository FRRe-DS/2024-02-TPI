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

import AgregarEscultorAevento from "../components/escultorEvento";
import RankingTable from "../components/ranking";
import { url } from "../utils";
import { useNavigate } from "react-router-dom";




const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    if (columnId !== "nombre" && columnId !== "nacionalidad" && columnId !== "escultor") {
        return false;
    }

    const itemRank = rankItem(String(row.getValue(columnId) ?? ""), value);
    addMeta({ itemRank });
    return itemRank.passed;
};

type Escultor = {
    id: number,
    nombre: string,
    apellido: string,
    correo: string,
    foto: string,
    bibliografia: string,
    nacionalidad: string,

};

interface Evento {
    id: number;
    nombre: string;
    fecha_inicio: string;
    finalizado: boolean;
}

export default function Certamen() {

    const navigate = useNavigate();

    const [eventos, setEventos] = useState<Evento[]>([]);
    const [certamen, setCertamen] = useState<Evento | null>(null);



    const fetchEventos = async () => {
        try {
            const response = await fetch(`${url}/eventos-bienal/`);
            const data: Evento[] = await response.json();
            setEventos(data);

            if (data.length > 0) {
                setCertamen(data[0]);


            }
        } catch (error) {
            console.error("Error al obtener eventos:", error);
        }
    };



    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(event.target.value, 10);
        const selectedEvento = eventos.find((evento) => evento.id === selectedId) || null;
        setCertamen(selectedEvento);
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
            cell: (props) => {


                return (
                    <div className="acciones_container">


                        <button onClick={() => navigate(`/ver-escultor/${props.row.original.id}`)}>
                            <i className="material-symbols-outlined">&#xe8f4;</i></button>
                    </div>
                );
            },
        }),
    ];

    const [data, _setData] = useState<Escultor[]>([]);
    const [globalFilter, setGlobalFilter] = useState("");


    async function fetch_escultores(certamenId: number | null) {
        type EscultorResponse = {
            id: number;
            nombre: string;
            apellido: string;
            nombre_completo: string;
            correo: string;
            foto: string;
            bibliografia: string;
            pais: {
                id: number;
                iso: string;
                nombre: string;
            };
        };

        try {
            const response = await fetch(`${url}/escultores_por_evento/?evento_id=${certamenId}`);
            if (!response.ok) {
                console.error(`Hubo un error al obtener los escultores por certamen`);
                _setData([]);
                return;
            }

            const escultoresResponse: EscultorResponse[] = await response.json();

            const escultores: Escultor[] = escultoresResponse.map((escultorResp) => ({
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

    const authToken = localStorage.getItem("token");
    if (!authToken) {
        window.location.href = "/Login";
    }

    const handleEstadoEvento = async () => {
        if (!certamen) {
            alert("No hay un evento seleccionado.");
            return;
        }

        const nuevoEstado = !certamen.finalizado;

        try {
            const response = await fetch(`${url}/eventos/${certamen.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${authToken}`,
                },
                body: JSON.stringify({ finalizado: nuevoEstado }),
            });

            if (response.ok) {

                setCertamen({ ...certamen, finalizado: nuevoEstado });


            } else {
                console.error("Error al actualizar el estado del evento:", response.statusText);

            }
        } catch (error) {
            console.error("Error al actualizar el estado del evento:", error);

        }
    };

    useEffect(() => {

        fetchEventos();
    }, []);



    useEffect(() => {
        if (certamen) {
            fetch_escultores(certamen.id);
        }
    }, [certamen]);

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
    };


    return (
        <div className="mainContainer">
            <Menu paginaActual={"Certamen"} />
            <section className="mainSection">
                <header className="header-section">
                    <h1 className="header-title">Certamen</h1>
                    <button className="btn-principal" onClick={handleOpenPopup}>Añadir pariticipante</button>
                    <AgregarEscultorAevento
                        isOpen={isPopupOpen}
                        onClose={handleClosePopup}
                        onNuevoEscultor={() => {
                            if (certamen) {
                                fetch_escultores(certamen.id);
                            } else {
                                console.warn("Certamen es null, no se puede actualizar la lista de escultores.");
                            }
                        }}
                        eventoId={certamen?.id ?? 1}
                    />

                </header>
                <div className="section-container">
                    <div className="action-btn__container">

                        <select
                            id="evento-selector"
                            value={certamen?.id || ""}
                            onChange={handleChange}
                            className="focus-input select-certamen"
                        >
                            {eventos.map((evento) => (
                                <option key={evento.id} value={evento.id}>
                                    {evento.nombre}
                                </option>
                            ))}
                        </select>

                        <button
                            className="btn cancelar finalizar"
                            onClick={handleEstadoEvento}
                            disabled={!certamen}
                        >
                            {certamen?.finalizado ? "Reabrir Evento" : "Finalizar Evento"}
                        </button>

                    </div>
                    {certamen?.finalizado &&
                        <>
                            <h2>Ranking</h2>
                            <RankingTable evento_id={certamen.id} />
                        </>
                    }

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


