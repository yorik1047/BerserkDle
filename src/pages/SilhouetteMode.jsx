import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import characterData from '../../berserk_chars.json';
import CountdownTimer from '../components/CountdownTimer';
import ModeSwitcher from '../components/ModeSwitcher';

// --- Helper: Path Resolution ---
const resolvePath = (path) => {
    if (!path) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${import.meta.env.BASE_URL}${cleanPath}`;
};

// Build candidate silhouette URLs in priority order:
// 1. Explicit silhouette_url or public/silhouettes/<stem>.webp
// 2. public/silhouettes/<stem>.png
// 3. Fallback to original character.image_url
const getSilhouetteCandidates = (character) => {
    if (!character) return [];
    const rawPath = (character.image_url || '').replace(/^\//, '');
    const stem = rawPath.replace(/\.[^.]+$/, '');
    const candidates = [];

    if (character.silhouette_url) {
        candidates.push(resolvePath(character.silhouette_url));
    }
    if (stem) {
        candidates.push(resolvePath(`silhouettes/${stem}.webp`));
        candidates.push(resolvePath(`silhouettes/${stem}.png`));
    }
    if (rawPath) {
        candidates.push(resolvePath(rawPath));
    }
    return [...new Set(candidates)];
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
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [imgCandidateIdx, setImgCandidateIdx] = useState(0);

    useEffect(() => {
        // Init Character
        const dailyIndex = getDailyIndex();
        setTargetCharacter(characterData[dailyIndex]);
        setImgCandidateIdx(0);

        // Init State from LocalStorage
        const todayStr = new Date().toISOString().split('T')[0];
        const savedState = JSON.parse(localStorage.getItem('berserkdle_silhouette_state') || '{}');
        const savedStreak = parseInt(localStorage.getItem('berserkdle_silhouette_streak') || '0');

        setStreak(savedStreak);

        if (savedState.date === todayStr) {
            setGuesses(savedState.guesses || []);
            setHasWon(savedState.won || false);
        }
    }, []);

    const handleGuess = (character) => {
        if (!targetCharacter || hasWon) return;

        const newGuesses = [character.id, ...guesses];
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

    // True Silhouette CSS Filter Calculation:
    // - Starts at: brightness(0) blur(6px) drop-shadow(0 0 10px rgba(220, 38, 38, 0.4))
    // - Reduces blur with each wrong attempt so the silhouette outline becomes razor-sharp (0px)
    // - Transitions to: brightness(1) blur(0px) when guessed
    const attempts = guesses.length;
    const maxBlurPx = 6;
    const blurStepPerAttempt = 1;
    const currentBlur = hasWon ? 0 : Math.max(0, maxBlurPx - attempts * blurStepPerAttempt);

    const silhouetteFilter = hasWon
        ? 'brightness(1) blur(0px)'
        : `brightness(0) blur(${currentBlur}px) drop-shadow(0 0 10px rgba(220, 38, 38, 0.4))`;

    const candidates = getSilhouetteCandidates(targetCharacter);
    const activeImageSrc = candidates[Math.min(imgCandidateIdx, candidates.length - 1)];

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
            <div className="relative z-10 flex flex-col items-center pb-6">

                {/* Quick Mode Switcher */}
                <ModeSwitcher wonTrigger={hasWon} />

                {/* HEADER */}
                <header className="w-full max-w-4xl px-4 flex justify-between items-start mb-8">
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

                    {/* Help Button */}
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        aria-label="How to Play"
                        className="w-10 h-10 flex items-center justify-center border border-red-900/40 rounded text-red-800 hover:text-red-400 hover:border-red-700/60 hover:drop-shadow-[0_0_10px_rgba(220,38,38,0.4)] transition-all duration-300 font-bold text-lg flex-shrink-0"
                    >
                        ?
                    </button>
                </header>

                <main className="flex flex-col items-center w-full max-w-md px-4">

                    {/* FULL-BODY / UPPER-BODY SILHOUETTE STAGE (No circular crop) */}
                    <div className="relative flex flex-col items-center justify-center w-full min-h-[280px] sm:min-h-[340px] mb-8 py-4">
                        {/* Ambient Crimson Aura Behind Silhouette */}
                        <div
                            className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.22)_0%,transparent_68%)] blur-2xl transition-opacity duration-1000 ${
                                hasWon ? 'opacity-80' : 'opacity-45'
                            }`}
                        />

                        {/* Character Silhouette Image */}
                        <img
                            src={activeImageSrc}
                            alt="Character Silhouette"
                            draggable="false"
                            onContextMenu={(e) => e.preventDefault()}
                            onError={() => {
                                if (imgCandidateIdx < candidates.length - 1) {
                                    setImgCandidateIdx((prev) => prev + 1);
                                }
                            }}
                            className="relative z-10 w-auto max-w-full pointer-events-none select-none"
                            style={{
                                maxHeight: '380px',
                                objectFit: 'contain',
                                filter: silhouetteFilter,
                                transition: 'filter 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                userSelect: 'none',
                                WebkitUserDrag: 'none',
                            }}
                        />

                        {/* Subtle Pedestal Line */}
                        <div className="w-48 h-px bg-gradient-to-r from-transparent via-red-800/50 to-transparent mt-3" />
                    </div>

                    {/* COUNTER */}
                    <div className="mb-8 text-center">
                        <p className="text-red-500/70 text-[10px] uppercase tracking-[0.35em] mb-2 font-bold">Attempts</p>
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
                            <CountdownTimer accentColor="red" />
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                <button
                                    onClick={() => {
                                        const shareText = `BerserkDle 🗡️\nMode: THE ECLIPSE 🌑\nAttempts: ${attempts}\nPlay now: https://berserk-dle.vercel.app/`;
                                        navigator.clipboard.writeText(shareText).then(() => {
                                            setIsCopied(true);
                                            setTimeout(() => setIsCopied(false), 2000);
                                        });
                                    }}
                                    className={`group px-8 py-3 border text-xs tracking-[0.3em] uppercase rounded-sm transition-all duration-300 cursor-pointer ${
                                        isCopied
                                            ? 'bg-red-600/30 border-red-400/60 text-red-200'
                                            : 'bg-gradient-to-r from-red-950/50 via-red-900/40 to-red-950/50 border-red-800/50 text-red-500 hover:bg-red-900/40 hover:text-white hover:border-red-500'
                                    }`}
                                >
                                    {isCopied ? 'Copied! ✓' : '📋 Share Result'}
                                </button>
                                <Link to="/" className="group px-8 py-3 bg-transparent border border-red-900/50 text-red-500 hover:bg-red-900 hover:text-white hover:border-red-500 transition-all text-xs tracking-[0.3em] uppercase rounded-sm">
                                    Return to Darkness
                                </Link>
                            </div>
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

            {/* --- HELP MODAL --- */}
            {isHelpOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    onClick={() => setIsHelpOpen(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

                    {/* Panel */}
                    <div
                        className="relative z-10 w-full max-w-md bg-[#0a0505] border border-red-900/50 rounded-lg shadow-[0_0_60px_rgba(220,38,38,0.15)] p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative corners */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-red-900/50" />
                        <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-red-900/50" />
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-red-900/50" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-red-700/50" />

                        {/* Close button */}
                        <button
                            onClick={() => setIsHelpOpen(false)}
                            aria-label="Close"
                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-red-900 hover:text-red-400 transition-colors text-lg font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-red-700 text-xs uppercase tracking-[0.4em] mb-6 font-bold text-center">How to Play</h2>

                        <p className="text-xs uppercase tracking-[0.3em] text-red-400/80 font-bold mb-3 text-center">THE ECLIPSE</p>
                        <p className="text-gray-400 text-sm leading-relaxed font-serif text-center">
                            Identify the character from their darkened silhouette.
                            The outline starts shrouded in blur — each wrong guess sharpens the silhouette edge until it is razor-clear.
                            Guess the right soul to lift the veil completely.
                        </p>

                        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
                        <p className="text-red-900/50 text-[10px] uppercase tracking-widest text-center mt-4">There is no escape. Guess to survive.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SilhouetteMode;
