import { useEffect, useState } from "react";
import "./crearEscultura.css";
import { url } from "../utils";

interface EditarEscultorPopupProps {
    isOpen: boolean;
    onClose: () => void;
    escultorId: number | null;
    onUpdate: () => void;  // Callback para actualizar la lista de escultores
}

type Escultor = {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    pais_id: number;
    fecha_nacimiento: string | null;
    foto: string | null;
    bibliografia: string;
};

export default function EditarEscultorPopup({
    isOpen,
    onClose,
    escultorId,
    onUpdate,
}: EditarEscultorPopupProps) {

    const [escultor, setEscultor] = useState<Escultor | null>(null);
    const [nombre, setNombre] = useState<string>("");
    const [apellido, setApellido] = useState<string>("");
    const [correo, setCorreo] = useState<string>("");
    const [fechaNacimiento, setFechaNacimiento] = useState<string>("");
    const [foto, setFoto] = useState<File | null>(null);
    const [paisId, setPaisId] = useState<number | null>(null);
    const [bibliografia, setBibliografia] = useState<string>("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      window.location.href = "/Login";
    }
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;

        if (file) {
            setFileName(file.name);
            setFoto(file)

            // Leer el archivo para la vista previa
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setPreviewImage(reader.result.toString());
                }
            };
            reader.readAsDataURL(file);
        } else {
            setFoto(null);
            setFileName(null);
            setPreviewImage(null);
        }
    };

    useEffect(() => {
        setFileName(null);
        setPreviewImage(null);
        setFoto(null);
        if (escultorId !== null) {
            fetch(`${url}/escultores/${escultorId}/`)
                .then((response) => response.json())
                .then((data) => {
                    setEscultor(data);
                    setNombre(data.nombre);
                    setApellido(data.apellido);
                    setCorreo(data.correo);
                    setFechaNacimiento(data.fecha_nacimiento || "");
                    // setFoto(data.foto || null);
                    // console.log(data.foto);
                    setBibliografia(data.bibliografia);
                    setPaisId(data.pais_id);
                })
                .catch((error) => console.error("Error al obtener el escultor:", error));
        }
    }, [escultorId]);


    const handleSubmit = (e: React.FormEvent) => {
        const cleanString = (input: string): string => {
            return input.replace(/[\r\n]/g, '').trim();
        }
        e.preventDefault();

        if (escultor) {

            const formData = new FormData();
            formData.append("nombre", cleanString(nombre));
            formData.append("apellido", cleanString(apellido));
            formData.append("correo", cleanString(correo));
            formData.append("pais_id", String(paisId));
            formData.append("fecha_nacimiento", fechaNacimiento || "");
            formData.append("bibliografia", cleanString(bibliografia));

            if (foto instanceof File) {
                formData.append("foto", foto);
                // console.debug(`Se ve asi ${foto?.name}`)
            }
            // console.table(formData);

            fetch(`${url}/escultores/${escultorId}/`, {
                method: "PUT",
                headers: {
                    Authorization: `Token ${authToken}`,
                },
                body: formData,
            })
                .then((response) => response.json())
                .then(() => {
                    onUpdate();
                    onClose();
                })
                .catch((error) => console.error("Error al actualizar el escultor:", error));
        }
    };




    if (!isOpen || escultor === null) return null;

    return (
        <>
            <div className="overlay" onClick={onClose}></div>
            <div className="popup">
                <h2>Editar Escultor</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="two-col-grid">
                        <div className="custom-file-upload">
                            <label htmlFor="file-upload">
                                {previewImage ? (
                                    <div className="cambiar-img">
                                        <img src={previewImage} alt="Vista previa" />
                                    </div>
                                ) : fileName ? (
                                    <div>
                                        <p>Archivo seleccionado: {fileName}</p>
                                    </div>
                                ) : escultor?.foto ? (
                                    <div className="cambiar-img">
                                        <img src={escultor.foto} alt="Foto actual" />
                                    </div>
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
                            <input
                                className="focus-input"
                                placeholder="Nombre"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                            <input
                                className="focus-input"
                                placeholder="Apellido"
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                            />
                            <input
                                className="focus-input"
                                placeholder="Correo"
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                            />
                            <input
                                className="focus-input"
                                type="date"
                                value={fechaNacimiento}
                                onChange={(e) => setFechaNacimiento(e.target.value)}
                            />
                        </div>
                    </div>
                    <textarea
                        placeholder="Bibliografía"
                        value={bibliografia}
                        onChange={(e) => setBibliografia(e.target.value)}
                        className="focus-input texarea-bigger"
                    />

                    <div className="divider"></div>
                    <div className="buttons">
                        <button type="button" onClick={onClose} className="btn canceclar">Cerrar</button>
                        <button type="submit" className="btn aceptar">Actualizar</button>
                    </div>

                </form>
            </div>
        </>
    );
}

