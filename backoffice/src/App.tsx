import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import Eventos from './pages/Eventos';
import Escultores from './pages/Escultores';
import Esculturas from './pages/Esculturas';
import LoginAdmin from './pages/Login';
import VerEscultura from './pages/verEscultura';
import EditarEscultura from './pages/editarEscultura';
import VerEvento from './pages/verEvento';
import EditarEvento from './pages/editarEvento';
import VerEscultor from './pages/verEscultor';
import EditarEscultor from './pages/editarEscultura';
import Certamen from './pages/Certamen';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/Login" replace />} />
                <Route path="/Login" element={<LoginAdmin />} />
                <Route path="/Eventos" element={<Eventos />} />
                <Route path="/Escultores" element={<Escultores />} />
                <Route path="/Esculturas" element={<Esculturas />} />
                <Route path="/Certamen" element={<Certamen />} />
                <Route path="/ver-escultura/:id" element={<VerEscultura />} />
                <Route path="/editar-escultura/:id" element={<EditarEscultura />} />
                <Route path="/ver-evento/:id" element={<VerEvento />} />
                <Route path="/editar-evento/:id" element={<EditarEvento />} />
                <Route path="/ver-escultor/:id" element={<VerEscultor />} />
                <Route path="/editar-escultor/:id" element={<EditarEscultor />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
