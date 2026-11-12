import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import MainMenu from './pages/MainMenu';
import ClassicMode from './pages/ClassicMode';
import SilhouetteMode from './pages/SilhouetteMode';
import EmojiMode from './pages/EmojiMode';
import SeoFooter from './components/SeoFooter';

function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <Routes>
                <Route path="/" element={<MainMenu />} />
                <Route path="/classic" element={<ClassicMode />} />
                <Route path="/silhouette" element={<SilhouetteMode />} />
                <Route path="/emoji" element={<EmojiMode />} />
            </Routes>
            <SeoFooter />
            <Analytics />
        </div>
    );
}

export default App;
