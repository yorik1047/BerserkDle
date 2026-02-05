import { Routes, Route } from 'react-router-dom';
import MainMenu from './pages/MainMenu';
import ClassicMode from './pages/ClassicMode';
import SilhouetteMode from './pages/SilhouetteMode';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainMenu />} />
            <Route path="/classic" element={<ClassicMode />} />
            <Route path="/silhouette" element={<SilhouetteMode />} />
        </Routes>
    );
}

export default App;