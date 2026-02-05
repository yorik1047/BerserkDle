import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import characterData from '../../berserk_chars.json';

// Helper function for image paths
const resolvePath = (path) => {
    if (!path) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${import.meta.env.BASE_URL}${cleanPath}`;
};

// Get daily character based on current date (deterministic)
// Uses offset to ensure different character from Classic Mode
const getDailyCharacter = () => {
    const today = new Date().toISOString().split('T')[0];

    // Simple hash function to generate pseudo-random index from date
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    // Add offset to differentiate from Classic Mode
    const index = (Math.abs(hash) + 123) % characterData.length;
    return characterData[index];
};

const SilhouetteMode = () => {
    const [targetCharacter, setTargetCharacter] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [hasGivenUp, setHasGivenUp] = useState(false);
    const [showWinFlash, setShowWinFlash] = useState(false);
    const [streak, setStreak] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        // 1. Load daily character
        const dailyTarget = getDailyCharacter();
        setTargetCharacter(dailyTarget);

        // 2. Load streak
        const savedStreak = parseInt(localStorage.getItem('berserkdle_silhouette_streak') || '0');
        setStreak(savedStreak);

        // 3. Check saved state for today
        const todayStr = new Date().toISOString().split('T')[0];
        const savedState = JSON.parse(localStorage.getItem('berserkdle_silhouette_state') || '{}');

        if (savedState.date === todayStr) {
            // Load today's progress
            setGuesses(savedState.guesses || []);
            setHasWon(savedState.won || false);
            setHasGivenUp(savedState.gaveUp || false);
        } else {
            // Clear old state, start fresh
            localStorage.removeItem('berserkdle_silhouette_state');
        }

        // 4. Countdown timer to midnight
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);

            const diff = midnight - now;
            if (diff <= 0) return "00:00:00";

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            return [
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0')
            ].join(':');
        };

        setTimeRemaining(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const saveGameState = (newGuesses, won, gaveUp) => {
        const todayStr = new Date().toISOString().split('T')[0];
        localStorage.setItem('berserkdle_silhouette_state', JSON.stringify({
            date: todayStr,
            guesses: newGuesses,
            won: won,
            gaveUp: gaveUp
        }));
    };

    const handleGuess = (character) => {
        if (!targetCharacter || hasWon || hasGivenUp) return;

        const newGuesses = [...guesses, character];
        setGuesses(newGuesses);

        const isWin = character.id === targetCharacter.id;

        if (isWin) {
            setHasWon(true);
            // Trigger dramatic flash effect
            setShowWinFlash(true);
            setTimeout(() => setShowWinFlash(false), 800);

            // Increment streak
            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem('berserkdle_silhouette_streak', newStreak.toString());

            saveGameState(newGuesses, true, false);
        } else {
            saveGameState(newGuesses, false, false);
        }
    };

    const handleGiveUp = () => {
        setHasGivenUp(true);

        // Reset streak on give up
        setStreak(0);
        localStorage.setItem('berserkdle_silhouette_streak', '0');

        saveGameState(guesses, false, true);
    };

    if (!targetCharacter) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-red-600 text-2xl font-bold animate-pulse">Loading the Abyss...</div>
            </div>
        );
    }

    const attempts = guesses.length;
    const isGameOver = hasWon || hasGivenUp;

    // --- BLUR LOGIC ---
    const maxBlurPx = 35;
    const attemptsToClear = 30;
    let currentBlur = Math.max(0, maxBlurPx - (attempts * (maxBlurPx / attemptsToClear)));
    if (isGameOver) currentBlur = 0;

    return (
        <div className="relative min-h-screen font-serif overflow-hidden">
            {/* ===== ECLIPSE BACKGROUND IMAGE ===== */}
            <div className="fixed inset-0 bg-black">
                {/* Background Image */}
                <img
                    src={`${import.meta.env.BASE_URL}images/eclipse_mode_bg.jpg`}
                    alt="Eclipse Background"
                    className="w-full h-full object-cover"
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            {/* Win Flash Effect */}
            {showWinFlash && (
                <div
                    className="fixed inset-0 z-50 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(220,38,38,0.8) 0%, transparent 70%)',
                        animation: 'winFlash 0.8s ease-out'
                    }}
                />
            )}

            {/* ===== CONTENT ===== */}
            <div className="relative z-10 text-white min-h-screen flex flex-col items-center py-8 px-4">

                {/* Header */}
                <header className="w-full max-w-4xl flex justify-between items-center mb-12">
                    <Link
                        to="/"
                        className="text-gray-500 hover:text-red-400 transition-all duration-300 flex items-center gap-2 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-sm uppercase tracking-wider">Back</span>
                    </Link>

                    <h1
                        className="text-4xl md:text-6xl font-bold text-red-600 tracking-widest uppercase text-center"
                        style={{
                            textShadow: '0 0 20px rgba(220,38,38,0.8), 0 0 40px rgba(220,38,38,0.5), 0 4px 8px rgba(0,0,0,0.9)',
                            fontFamily: 'serif',
                            letterSpacing: '0.15em'
                        }}
                    >
                        The Eclipse
                    </h1>

                    {/* Streak Counter */}
                    <div className="flex flex-col items-center">
                        <span
                            className="font-bold text-2xl text-white"
                            style={{ textShadow: '0 0 10px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.9)' }}
                        >
                            {streak}
                        </span>
                        <span className="text-gray-500 text-xs uppercase tracking-wider">Streak</span>
                    </div>
                </header>

                <main className="flex flex-col items-center w-full max-w-md">

                    {/* ===== DEMONIC IMAGE FRAME ===== */}
                    <div className="relative mb-10 group">
                        {/* Outer glow rings */}
                        <div className="absolute -inset-6 rounded-full opacity-40 blur-xl bg-gradient-to-r from-red-900 via-red-700 to-red-900 animate-pulse" />
                        <div className="absolute -inset-4 rounded-full opacity-30 blur-lg bg-gradient-to-r from-red-800 to-red-900" />

                        {/* Main frame container */}
                        <div className="relative w-72 h-72 md:w-96 md:h-96">
                            {/* Ornate border effect using pseudo-elements */}
                            <div
                                className="absolute inset-0 rounded-lg overflow-hidden"
                                style={{
                                    background: 'linear-gradient(135deg, #1a0000 0%, #0a0000 100%)',
                                    padding: '6px',
                                    boxShadow: 'inset 0 0 30px rgba(139,0,0,0.6), 0 0 50px rgba(139,0,0,0.4)',
                                }}
                            >
                                {/* Inner jagged border effect */}
                                <div
                                    className="w-full h-full relative overflow-hidden rounded"
                                    style={{
                                        background: 'linear-gradient(135deg, #2a0000 0%, #0a0000 100%)',
                                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9), inset 0 0 40px rgba(139,0,0,0.3)',
                                    }}
                                >
                                    {/* Character Image */}
                                    <img
                                        src={resolvePath(targetCharacter.image_url)}
                                        alt={isGameOver ? targetCharacter.name : "Target Silhouette"}
                                        className="w-full h-full object-cover"
                                        style={{
                                            filter: `blur(${currentBlur.toFixed(1)}px) brightness(0.9)`,
                                            transition: 'filter 0.8s ease-in-out'
                                        }}
                                    />

                                    {/* Red overlay when not won */}
                                    {!isGameOver && (
                                        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-red-950/30 to-black/40 pointer-events-none mix-blend-multiply" />
                                    )}
                                </div>
                            </div>

                            {/* Corner ornaments */}
                            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-red-700 opacity-60" style={{ transform: 'rotate(-45deg)' }} />
                            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-red-700 opacity-60" style={{ transform: 'rotate(45deg)' }} />
                            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-red-700 opacity-60" style={{ transform: 'rotate(-135deg)' }} />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-red-700 opacity-60" style={{ transform: 'rotate(135deg)' }} />
                        </div>
                    </div>

                    {/* ===== GAME STATUS ===== */}
                    <div className="mb-6 text-center">
                        <p
                            className="text-gray-300 uppercase tracking-[0.3em] text-sm mb-2 font-bold"
                            style={{ textShadow: '0 0 10px rgba(220,38,38,0.5), 0 2px 4px rgba(0,0,0,0.8)' }}
                        >
                            Attempts: <span className="text-red-500 font-bold text-2xl ml-2" style={{ textShadow: '0 0 15px rgba(239,68,68,0.8)' }}>{attempts}</span>
                        </p>
                        {!isGameOver && attempts > 0 && attempts < attemptsToClear && (
                            <p className="text-gray-600 text-xs italic mt-2 animate-pulse">The vision clears with each sacrifice...</p>
                        )}
                    </div>

                    {/* ===== WIN STATE ===== */}
                    {hasWon && (
                        <div className="flex flex-col items-center gap-6 animate-fadeIn">
                            <h2
                                className="text-3xl font-bold text-white text-center"
                                style={{ textShadow: '0 0 20px rgba(255,255,255,0.5), 0 4px 6px rgba(0,0,0,0.9)' }}
                            >
                                It was <span className="text-red-500" style={{ textShadow: '0 0 25px rgba(239,68,68,0.8)' }}>{targetCharacter.name}</span>!
                            </h2>

                            {/* Countdown Timer */}
                            <div className="text-center">
                                <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">Next Eclipse in:</p>
                                <p className="text-2xl font-mono text-red-600 font-bold" style={{ textShadow: '0 0 15px rgba(220,38,38,0.6)' }}>
                                    {timeRemaining}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ===== GIVE UP STATE ===== */}
                    {hasGivenUp && !hasWon && (
                        <div className="flex flex-col items-center gap-6 animate-fadeIn">
                            <h2
                                className="text-3xl font-bold text-white text-center"
                                style={{ textShadow: '0 0 20px rgba(255,255,255,0.5), 0 4px 6px rgba(0,0,0,0.9)' }}
                            >
                                It was <span className="text-red-500" style={{ textShadow: '0 0 25px rgba(239,68,68,0.8)' }}>{targetCharacter.name}</span>
                            </h2>
                            <p className="text-gray-400 italic">You submitted to fate...</p>

                            {/* Countdown Timer */}
                            <div className="text-center">
                                <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">Next Eclipse in:</p>
                                <p className="text-2xl font-mono text-red-600 font-bold" style={{ textShadow: '0 0 15px rgba(220,38,38,0.6)' }}>
                                    {timeRemaining}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ===== ACTIVE GAME STATE ===== */}
                    {!isGameOver && (
                        <div className="w-full flex flex-col gap-5">
                            <SearchBar
                                onGuess={handleGuess}
                                guessedIds={guesses.map(g => g.id)}
                                disabled={isGameOver}
                            />

                            {/* Give Up Button - Corrupted Tablet Style */}
                            <button
                                onClick={handleGiveUp}
                                className="relative px-6 py-2 text-sm uppercase tracking-widest group transition-all duration-300 hover:scale-102 self-center"
                                style={{
                                    background: 'linear-gradient(135deg, #0a0000 0%, #1a0000 100%)',
                                    border: '2px solid #3d0000',
                                    boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.8)',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                                }}
                            >
                                <span className="relative z-10 text-gray-600 group-hover:text-red-400 transition-colors">
                                    Submit to Fate
                                </span>
                                <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/10 transition-all duration-300" />
                            </button>
                        </div>
                    )}

                    {/* Previous Wrong Guesses */}
                    {guesses.filter(g => g.id !== targetCharacter.id).length > 0 && (
                        <div className="mt-10 w-full">
                            <p className="text-gray-600 text-xs uppercase tracking-[0.3em] mb-3 text-center font-bold">
                                Fallen Souls
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {guesses.filter(g => g.id !== targetCharacter.id).map((char, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-black/50 border border-red-900/30 px-3 py-1 rounded text-gray-500 text-sm"
                                        style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}
                                    >
                                        {char.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-auto pt-16 text-center text-gray-700 text-xs">
                    <p style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                        Unofficial Fan Game. Berserk is © Kentaro Miura.
                    </p>
                </footer>
            </div>

            {/* ===== CUSTOM ANIMATIONS ===== */}
            <style>{`
                @keyframes eclipsePulse {
                    0%, 100% { 
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 0.3;
                    }
                    50% { 
                        transform: translate(-50%, -50%) scale(1.1);
                        opacity: 0.4;
                    }
                }

                @keyframes bloodDrift {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }

                @keyframes winFlash {
                    0% { opacity: 0; }
                    30% { opacity: 1; }
                    100% { opacity: 0; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SilhouetteMode;