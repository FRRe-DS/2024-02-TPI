import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Eventos from './pages/Eventos';
import Escultores from './pages/Escultores';
import Esculturas from './pages/Esculturas';
import LoginAdmin from './pages/LogAdmin';
import Main from './pages/Main';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/*<Route path="/" element={<Navigate to="/Eventos" replace />} />*/}
                <Route path="/" element={<Main />} />
                <Route path="/Eventos" element={<Eventos />} />
                <Route path="/Escultores" element={<Escultores />} />
                <Route path="/Esculturas" element={<Esculturas />} />
                <Route path="/LogAdmin" element={<LoginAdmin />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
