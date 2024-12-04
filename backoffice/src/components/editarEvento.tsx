import { useEffect, useState } from "react";
import "./crearEvento.css";
import { url } from "../utils";


interface EditarEventoPopupProps {
    isOpen: boolean;
    onClose: () => void;
    eventoId: number | null;
    onUpdate: () => void; // Callback para actualizar la lista de eventos
}



export default function EditarEventoPopup({
    isOpen,
    onClose,
    eventoId,
    onUpdate,
}: EditarEventoPopupProps) {
    const [nombre, setNombre] = useState<string>("");
    const [lugar, setLugar] = useState<string>("");
    const [lugarId, setLugarId] = useState<number>(0);
    const [tematica, setTematica] = useState<string>("");
    const [tematicaId, setTematicaId] = useState<number>(0);
    const [inicio, setInicio] = useState<string>(""); // Fecha en formato ISO
    const [fin, setFin] = useState<string>(""); // Fecha en formato ISO
    const [descripcion, setDescripcion] = useState<string>("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const authToken = localStorage.getItem("token");

    if (!authToken) {
        throw new Error("Token no encontrado. Inicia sesión nuevamente.");
    }

    useEffect(() => {
        if (eventoId !== null) {
            fetch(`${url}/eventos/${eventoId}/`, {
                headers: { Authorization: `Token ${authToken}` },
            })
                .then((response) => response.json())
                .then((data) => {
                    setNombre(data.nombre || "");
                    setLugar(data.lugar.nombre || "");
                    setTematica(data.tematica.nombre || "");
                    setInicio(data.fecha_inicio)
                    setFin(data.fecha_fin)
                    setLugarId(data.lugar_id)
                    setTematicaId(data.tematica_id)
                    setDescripcion(data.descripcion || "");
                    if (data.foto) {
                        setPreviewImage(data.foto);
                    }
                })
                .catch((error) => console.error("Error al obtener el evento:", error));
        }
    }, [eventoId, url, authToken]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setPreviewImage(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("lugar", lugar);
        formData.append("tematica", tematica);
        formData.append("fecha_inicio", inicio);
        formData.append("fecha_fin", fin);
        formData.append("lugar_id", String(lugarId));
        formData.append("tematica_id", String(tematicaId));
        formData.append("descripcion", descripcion);
        if (file) {
            formData.append("foto", file);
        }

        fetch(`${url}/eventos/${eventoId}/`, {
            method: "PUT",
            headers: { Authorization: `Token ${authToken}` },
            body: formData,
        })
            .then((response) => response.json())
            .then(() => {
                onUpdate();
                onClose();
            })
            .catch((error) => console.error("Error al actualizar el evento:", error));
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="overlay" onClick={onClose}></div>
            <div className="popupContainer">
                <h2>Editar Evento</h2>
                <div className="divider"></div>
                <form onSubmit={handleSubmit} className="form">
                    <div className="two-col-grid">
                        <div className="custom-file-upload">
                            <label htmlFor="file-upload">
                                {previewImage ? (
                                    <div className="cambiar-img">
                                        <img src={previewImage} alt="Vista previa" />
                                    </div>
                                ) : fileName ? (
                                    <p>Archivo seleccionado: {fileName}</p>
                                ) : (
                                    <p className="fill-space">Seleccionar foto</p>
                                )}
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                        </div>
                        <div className="form">
                            <label htmlFor="nombre-evento"><p>Nombre</p></label>
                            <input
                                id="nombre-evento"
                                className="focus-input"
                                placeholder="Nombre del evento"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                            <label htmlFor="lugar-evento"><p>Ubicación</p></label>
                            <input
                                id="lugar-evento"
                                className="focus-input readonly"
                                placeholder="Lugar"
                                readOnly
                                type="text"
                                value={lugar}
                                onChange={(e) => setLugar(e.target.value)}
                            />
                            <label htmlFor="tematica-evento"><p>Temática</p></label>
                            <input
                                id="tematica-evento"
                                className="focus-input readonly"
                                placeholder="Temática"
                                type="text"
                                value={tematica}
                                readOnly
                                onChange={(e) => setTematica(e.target.value)}
                            />
                            <label htmlFor="descripcion-evento"><p>Descripción</p></label>
                            <textarea
                                id="descripcion-evento"
                                className="focus-input textarea fill-space min-heigh-200"
                                placeholder="Descripción"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </div>



                    </div>


                    <div className="buttons">
                        <button type="button" onClick={onClose} className="btn cancelar">
                            Cerrar
                        </button>
                        <button type="submit" className="btn aceptar">
                            Actualizar
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
