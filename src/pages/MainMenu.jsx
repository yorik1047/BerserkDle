import React from 'react';
import { Link } from 'react-router-dom';

const MainMenu = () => {
    const resolvePath = (path) => `${import.meta.env.BASE_URL}${path}`;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-serif flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* --- GLOBAL NOISE TEXTURE --- */}
            <div className="fixed inset-0 opacity-[0.08] pointer-events-none z-50 mix-blend-overlay"
                style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}>
            </div>

            {/* --- VIGNETTE EFFECT --- */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_120%)] pointer-events-none z-40"></div>

            {/* --- HEADER --- */}
            <div className="z-10 text-center mb-16 relative">
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-red-900 to-transparent mx-auto mb-6 opacity-50"></div>

                <h1 className="text-5xl md:text-8xl font-black tracking-[0.2em] text-gray-200 uppercase"
                    style={{ textShadow: "0 0 20px rgba(0,0,0,0.8)" }}>
                    BERSERK<span className="text-red-800">DLE</span>
                </h1>

                <div className="flex items-center justify-center gap-4 mt-4 opacity-60">
                    <span className="h-px w-12 bg-gray-600"></span>
                    <p className="text-xs tracking-[0.4em] uppercase text-gray-400">Sacrifice Your Logic</p>
                    <span className="h-px w-12 bg-gray-600"></span>
                </div>
            </div>

            {/* --- THE CARDS (Brutal Style) --- */}
            <div className="z-10 flex flex-col md:flex-row gap-0 w-full max-w-5xl h-auto md:h-[500px] border border-gray-800 bg-black/50 shadow-2xl relative">

                {/* === LEFT: CLASSIC MODE (THE STRUGGLE) === */}
                <Link to="/classic" className="group relative flex-1 border-b md:border-b-0 md:border-r border-gray-800 cursor-pointer overflow-hidden transition-all duration-500 hover:flex-[1.5]">

                    {/* Background Image (Guts) */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={resolvePath('images/classic_mode_bg.jpg')}
                            alt="The Struggle"
                            className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-110"
                        />
                        {/* Cold overlay for steel atmosphere */}
                        <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
                    </div>

                    {/* Dark Overlay that disappears on hover */}
                    <div className="absolute inset-0 bg-black/70 group-hover:bg-transparent transition-colors duration-700 z-1"></div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 transition-transform duration-500">
                        <h2 className="text-2xl md:text-4xl font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors border-b-2 border-transparent group-hover:border-white pb-2 drop-shadow-lg">
                            The Struggle
                        </h2>
                        <p className="mt-4 text-gray-500 text-xs uppercase tracking-widest group-hover:text-gray-300 font-bold">
                            Classic Guessing
                        </p>
                    </div>
                </Link>

                {/* === RIGHT: ECLIPSE MODE (THE SACRIFICE) === */}
                <Link to="/silhouette" className="group relative flex-1 cursor-pointer overflow-hidden transition-all duration-500 hover:flex-[1.5]">

                    {/* Background Image (Eclipse) */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={resolvePath('images/eclipse_mode_bg.jpg')}
                            alt="The Eclipse"
                            className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-110"
                        />
                        {/* Red overlay for hell atmosphere */}
                        <div className="absolute inset-0 bg-red-900/20 mix-blend-overlay"></div>
                    </div>

                    {/* Dark Overlay that disappears on hover */}
                    <div className="absolute inset-0 bg-black/70 group-hover:bg-transparent transition-colors duration-700 z-1"></div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                        <h2 className="text-2xl md:text-4xl font-bold text-red-900/60 uppercase tracking-widest group-hover:text-red-500 transition-colors border-b-2 border-transparent group-hover:border-red-600 pb-2 drop-shadow-lg">
                            The Eclipse
                        </h2>
                        <p className="mt-4 text-red-900/40 text-xs uppercase tracking-widest group-hover:text-red-300 font-bold">
                            Silhouette Mode
                        </p>
                    </div>
                </Link>
            </div>

            {/* --- DECORATIVE CORNERS --- */}
            <div className="fixed top-6 left-6 w-8 h-8 border-l-2 border-t-2 border-gray-800 opacity-50 pointer-events-none"></div>
            <div className="fixed bottom-6 right-6 w-8 h-8 border-r-2 border-b-2 border-gray-800 opacity-50 pointer-events-none"></div>

            {/* Footer */}
            <div className="absolute bottom-8 text-[10px] text-gray-600 tracking-[0.5em] uppercase hover:text-red-900 transition-colors cursor-default">
                Casualty Count: Infinite
            </div>
        </div>
    );
};

export default MainMenu;