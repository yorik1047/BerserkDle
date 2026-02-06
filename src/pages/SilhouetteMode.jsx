import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import characterData from '../../berserk_chars.json';

// --- Helper: Path Resolution ---
const resolvePath = (path) => {
    if (!path) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${import.meta.env.BASE_URL}${cleanPath}`;
};

// --- Helper: Daily Logic ---
const getDailyIndex = () => {
    const epoch = new Date("2024-01-01T00:00:00.000Z");
    const today = new Date();
    const diffTime = Math.abs(today - epoch);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays + 123) % characterData.length;
};

const SilhouetteMode = () => {
    const [targetCharacter, setTargetCharacter] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [streak, setStreak] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        // Init Character
        const dailyIndex = getDailyIndex();
        setTargetCharacter(characterData[dailyIndex]);

        // Init State from LocalStorage
        const todayStr = new Date().toISOString().split('T')[0];
        const savedState = JSON.parse(localStorage.getItem('berserkdle_silhouette_state') || '{}');
        const savedStreak = parseInt(localStorage.getItem('berserkdle_silhouette_streak') || '0');

        setStreak(savedStreak);

        if (savedState.date === todayStr) {
            setGuesses(savedState.guesses || []);
            setHasWon(savedState.won || false);
        }

        // Timer Logic
        const timer = setInterval(() => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;

            if (diff <= 0) {
                setTimeRemaining("00:00:00");
            } else {
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
                const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
                const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
                setTimeRemaining(`${h}:${m}:${s}`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleGuess = (character) => {
        if (!targetCharacter || hasWon) return;

        const newGuesses = [...guesses, character.id];
        setGuesses(newGuesses);

        const isWin = character.id === targetCharacter.id;

        if (isWin) {
            setHasWon(true);
            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem('berserkdle_silhouette_streak', newStreak.toString());
        }

        localStorage.setItem('berserkdle_silhouette_state', JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            guesses: newGuesses,
            won: isWin
        }));
    };

    if (!targetCharacter) return <div className="text-red-900 text-center mt-20 animate-pulse font-serif tracking-widest">SUMMONING...</div>;

    // Blur Calculation with minimum floor
    const attempts = guesses.length;
    const maxBlurPx = 40;
    const attemptsToClear = 25;
    let currentBlur = Math.max(0, maxBlurPx - (attempts * (maxBlurPx / attemptsToClear)));
    // Enforce minimum blur floor of 5px until they win
    if (!hasWon) {
        currentBlur = Math.max(5, currentBlur);
    } else {
        currentBlur = 0;
    }

    return (
        // ROOT CONTAINER: Transparent background, relative positioning
        <div className="min-h-screen bg-transparent relative overflow-x-hidden font-serif text-red-100 selection:bg-red-900 selection:text-white">

            {/* --- 1. BACKGROUND LAYER (Fixed & Negative Z-Index) --- */}
            <div className="fixed inset-0 z-[-1]">
                <img
                    src={`${import.meta.env.BASE_URL}images/eclipse_final_bg.jpg`}
                    alt="Eclipse Background"
                    className="w-full h-full object-cover opacity-60 grayscale brightness-50"
                />
                {/* Overlay for atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black mix-blend-multiply"></div>
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
                    style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}>
                </div>
            </div>

            {/* --- 2. GAME CONTENT (Positive Z-Index) --- */}
            <div className="relative z-10 flex flex-col items-center py-6">

                {/* HEADER */}
                <header className="w-full max-w-4xl px-4 flex justify-between items-start mb-12">
                    <Link to="/" className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-2 group font-bold tracking-[0.2em] uppercase text-[10px]">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Escape
                    </Link>

                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-black drop-shadow-[0_4px_10px_rgba(220,38,38,0.5)] tracking-[0.2em] uppercase text-shadow-red text-center">
                            The Eclipse
                        </h1>
                        <div className="flex items-center gap-3 mt-4 bg-black/40 px-4 py-2 border border-red-900/30 rounded backdrop-blur-sm">
                            <span className="text-[9px] uppercase tracking-[0.3em] text-red-500/70">Survival Streak</span>
                            <div className="text-red-500 font-mono font-bold text-xl drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]">
                                {streak}
                            </div>
                        </div>
                    </div>

                    <div className="w-16"></div>
                </header>

                <main className="flex flex-col items-center w-full max-w-md px-4">

                    {/* PORTAL / IMAGE CONTAINER */}
                    <div className="relative group mb-10">
                        {/* Red Glow Behind */}
                        <div className={`absolute -inset-4 bg-gradient-to-b from-red-600 to-black rounded-full blur-xl opacity-20 transition-opacity duration-1000 ${hasWon ? 'opacity-50 animate-pulse' : ''}`}></div>

                        {/* The Image Itself */}
                        <div className="relative w-64 h-64 md:w-80 md:h-80 bg-black rounded-full border-4 border-red-900/40 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] ring-1 ring-red-950">
                            <img
                                src={resolvePath(targetCharacter.image_url)}
                                alt="Silhouette"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                className="w-full h-full object-cover scale-110 pointer-events-none select-none"
                                style={{
                                    filter: `grayscale(100%) blur(${currentBlur.toFixed(1)}px) brightness(${hasWon ? 1 : 0.7})`,
                                    transition: 'filter 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    userSelect: 'none',
                                    WebkitUserDrag: 'none'
                                }}
                            />
                            {!hasWon && <div className="absolute inset-0 bg-red-900/10 mix-blend-overlay pointer-events-none"></div>}
                        </div>
                    </div>

                    {/* COUNTER */}
                    <div className="mb-8 text-center">
                        <p className="text-red-900/60 text-[9px] uppercase tracking-[0.4em] mb-2 font-bold">Blood Sacrifices</p>
                        <p className="text-3xl font-bold text-red-600 font-mono drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]">{attempts}</p>
                    </div>

                    {/* GAME INPUT / WIN STATE */}
                    {hasWon ? (
                        <div className="flex flex-col items-center gap-8 w-full animate-fadeInUp">
                            {/* Victory Revelation Banner - Burning Metal Effect */}
                            <div className="w-full bg-gradient-to-r from-transparent via-red-950/30 to-transparent border-y border-red-900/50 py-8 backdrop-blur-md mb-6">
                                <h2 className="text-sm text-gray-500 uppercase tracking-[0.4em] mb-4 text-center">The Veil is Lifted</h2>
                                <p className="font-serif font-black text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-600 to-black uppercase tracking-[0.3em] drop-shadow-[0_2px_2px_rgba(0,0,0,1)] drop-shadow-[0_0_15px_rgba(220,38,38,0.6)] text-center">
                                    {targetCharacter.name}
                                </p>
                            </div>
                            <div className="w-full bg-red-950/10 border-y border-red-900/30 p-6 flex flex-col items-center gap-2 backdrop-blur-md">
                                <p className="text-red-700 text-[10px] uppercase tracking-[0.3em]">Next Eclipse In</p>
                                <p className="text-2xl font-mono text-red-500">{timeRemaining}</p>
                            </div>
                            <Link to="/" className="group px-8 py-3 bg-transparent border border-red-900/50 text-red-500 hover:bg-red-900 hover:text-white hover:border-red-500 transition-all text-xs tracking-[0.3em] uppercase rounded-sm">
                                Return to Darkness
                            </Link>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-5">
                            <div className="relative group z-50">
                                <div className="absolute -inset-0.5 bg-red-900/20 rounded blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <SearchBar onGuess={handleGuess} guessedIds={guesses} disabled={hasWon} />
                            </div>

                            {/* Previous Guesses List */}
                            {guesses.length > 0 && (
                                <div className="w-full mt-4 space-y-1 max-h-60 overflow-y-auto">
                                    {guesses.map((guessId, idx) => {
                                        const guessedChar = characterData.find(c => c.id === guessId);
                                        if (!guessedChar) return null;
                                        return (
                                            <div key={idx} className="flex items-center gap-3 bg-black/30 border border-red-900/20 px-3 py-2 rounded backdrop-blur-sm">
                                                <img
                                                    src={resolvePath(guessedChar.image_url)}
                                                    alt={guessedChar.name}
                                                    className="w-8 h-8 rounded-full object-cover border border-red-900/40 grayscale"
                                                />
                                                <span className="text-sm text-red-300/80 font-mono">{guessedChar.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <p className="text-center text-[9px] text-gray-700 uppercase tracking-widest mt-4">
                                There is no escape. Guess to survive.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SilhouetteMode;
