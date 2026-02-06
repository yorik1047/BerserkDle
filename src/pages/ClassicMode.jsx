import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import GuessGrid from '../components/GuessGrid';
import InfoModal from '../components/InfoModal';
import WinModal from '../components/WinModal';
import GrimParticles from '../components/GrimParticles';
import { getDailyCharacter, compareAttributes } from '../utils/GameLogic';
import BerserkConfetti from '../components/BerserkConfetti';

function ClassicMode() {
    const [targetCharacter, setTargetCharacter] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [showWin, setShowWin] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        // 1. Load daily character
        const dailyTarget = getDailyCharacter();
        setTargetCharacter(dailyTarget);

        // 2. Check saved state
        const todayStr = new Date().toISOString().split('T')[0];
        const savedState = JSON.parse(localStorage.getItem('berserkdle_state') || '{}');
        const savedStreak = parseInt(localStorage.getItem('berserkdle_streak') || '0');

        setStreak(savedStreak);

        if (savedState.date === todayStr) {
            setGuesses(savedState.guesses || []);
            setHasWon(savedState.won || false);
            setShowHint(savedState.showHint || false);
            if (savedState.won) {
                setShowWin(true);
            }
        } else {
            localStorage.removeItem('berserkdle_state');
        }

        // 3. Show intro for newcomers
        const introSeen = localStorage.getItem('berserkdle_intro_seen');
        if (!introSeen) {
            setShowInfo(true);
            localStorage.setItem('berserkdle_intro_seen', 'true');
        }

        // 4. Timer
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

    const handleGuess = (character) => {
        if (!targetCharacter || hasWon) return;

        const result = compareAttributes(character, targetCharacter);
        const newGuesses = [...guesses, result];

        setGuesses(newGuesses);

        const isWin = character.id === targetCharacter.id;
        if (isWin) {
            setHasWon(true);
            setShowWin(true);
            const newStreak = streak + 1;
            setStreak(newStreak);
            localStorage.setItem('berserkdle_streak', newStreak.toString());
        }

        // Save progress
        localStorage.setItem('berserkdle_state', JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            guesses: newGuesses,
            won: isWin,
            showHint: showHint
        }));
    };

    const handleDevReset = () => {
        if (window.confirm("RESET ALL PROGRESS? This is for testing only.")) {
            localStorage.clear();
            // Fix: Redirect to root (Home) to avoid GitHub Pages 404 error on sub-routes
            window.location.href = import.meta.env.BASE_URL;
        }
    };

    return (
        <>
            {/* Background effects (Ash + Brand of Sacrifice) */}
            {hasWon && <GrimParticles />}
            {hasWon && <BerserkConfetti />}

            {/* Main container with Atmospheric Background Image */}
            <div className="relative min-h-screen overflow-x-hidden">

                {/* Full-Screen Background Image - Lowest Layer */}
                <img
                    src={`${import.meta.env.BASE_URL}images/classic_gameplay_bg.jpg`}
                    alt=""
                    className="fixed inset-0 w-full h-full object-cover z-0"
                />

                {/* Dark Overlay for Text Readability */}
                <div className="fixed inset-0 bg-black/70 z-0" />

                {/* Content Container - Above Background */}
                <div className="relative z-10 text-white min-h-screen flex flex-col items-center py-10 font-serif">

                    {/* Modals */}
                    {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
                    {showWin && hasWon && (
                        <WinModal
                            character={targetCharacter}
                            guessCount={guesses.length}
                            nextCharacterTime={timeRemaining}
                            onClose={() => setShowWin(false)}
                        />
                    )}

                    {/* Header with Dark Fantasy Styling */}
                    <header className="w-full max-w-4xl px-4 flex justify-between items-start mb-8 z-10">

                        {/* Back Button - Runic Symbol */}
                        <Link
                            to="/"
                            className="w-10 h-10 flex items-center justify-center border border-stone-800/30 rounded text-stone-600 hover:text-amber-200 hover:border-amber-600/40 hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] transition-all duration-300 text-xl"
                            aria-label="Back to Menu"
                        >
                            ←
                        </Link>

                        {/* Title Section - Metallic Blood-Stained */}
                        <div className="text-center flex-1">
                            <h1 className="font-serif font-black bg-gradient-to-b from-gray-100 to-gray-400 bg-clip-text text-transparent text-5xl md:text-6xl uppercase tracking-[0.2em] mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                                DAILY GUESS
                            </h1>
                            <p className="text-red-900/70 text-xs italic tracking-wide drop-shadow-[0_0_4px_rgba(127,29,29,0.5)]">
                                The Struggle Continues...
                            </p>
                        </div>

                        {/* Help Button - Runic Symbol */}
                        <button
                            onClick={() => setShowInfo(true)}
                            className="w-10 h-10 flex items-center justify-center border border-stone-800/30 rounded text-stone-600 hover:text-amber-200 hover:border-amber-600/40 hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] transition-all duration-300 font-bold text-xl"
                            aria-label="How to Play"
                        >
                            ?
                        </button>
                    </header>

                    {/* Stats Bar - Metal Plates */}
                    <div className="mb-6 flex gap-6 z-10">
                        {/* Streak Counter - Obsidian Plate with Conditional Green Glow */}
                        <div className="bg-gradient-to-b from-gray-900/70 to-black/80 border-2 border-gray-700 px-6 py-3 rounded flex flex-col items-center min-w-[100px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" style={streak > 0 ? { boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 0 15px rgba(16,185,129,0.3)' } : {}}>
                            <span className="font-mono text-2xl text-white font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{streak}</span>
                            <span className="text-gray-400 text-xs uppercase tracking-[0.15em] mt-1">Streak</span>
                        </div>

                        {/* Attempts Counter - Worn Iron Plate with Red Glow */}
                        <div className="bg-gradient-to-b from-gray-900/70 to-black/80 border-2 border-gray-700 px-6 py-3 rounded flex flex-col items-center min-w-[100px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_0_12px_rgba(220,38,38,0.25)]">
                            <span className="font-mono text-2xl text-red-400 font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{guesses.length}</span>
                            <span className="text-gray-400 text-xs uppercase tracking-[0.15em] mt-1">Attempts</span>
                        </div>
                    </div>

                    {/* Hint System - Dark Fantasy */}
                    {!hasWon && (
                        <div className="mb-4 z-10 w-full max-w-md flex justify-center px-4">
                            {guesses.length < 15 ? (
                                <div className="bg-stone-900/60 backdrop-blur-sm border-2 border-stone-700/50 px-5 py-3 rounded text-stone-500 text-sm flex items-center gap-3 select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                                    <span className="text-xl" style={{ textShadow: '0 2px 3px rgba(0,0,0,0.8)' }}>🔒</span>
                                    <span className="tracking-widest uppercase text-xs font-serif">Sealed in {15 - guesses.length} attempts</span>
                                </div>
                            ) : !showHint ? (
                                <button
                                    onClick={() => {
                                        setShowHint(true);
                                        localStorage.setItem('berserkdle_state', JSON.stringify({
                                            date: new Date().toISOString().split('T')[0],
                                            guesses: guesses,
                                            won: false,
                                            showHint: true
                                        }));
                                    }}
                                    className="bg-gradient-to-r from-purple-950/40 via-blue-950/40 to-purple-950/40 hover:from-purple-900/50 hover:via-blue-900/50 hover:to-purple-900/50 border-2 border-purple-500/50 text-purple-200 px-8 py-3 rounded-lg text-sm transition-all flex items-center gap-3 animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] cursor-pointer backdrop-blur-sm"
                                >
                                    <span className="text-xl">🔮</span>
                                    <span className="font-bold tracking-wider uppercase font-serif">Unveil The Whisper</span>
                                </button>
                            ) : (
                                <div className="bg-gradient-to-br from-amber-950/90 to-yellow-950/80 border-4 border-amber-700/50 p-5 rounded shadow-[0_0_30px_rgba(217,119,6,0.3)] relative overflow-hidden w-full backdrop-blur-sm">
                                    <div className="absolute top-0 right-0 -mt-3 -mr-3 w-16 h-16 bg-amber-600/20 rounded-full blur-2xl"></div>
                                    <div className="absolute bottom-0 left-0 -mb-3 -ml-3 w-16 h-16 bg-yellow-600/20 rounded-full blur-2xl"></div>
                                    <div className="relative z-10">
                                        <p className="text-[11px] text-amber-600 font-bold uppercase mb-2 tracking-[0.2em] text-center font-serif">◈ Ancient Whisper ◈</p>
                                        <p className="text-amber-100/95 italic font-serif text-lg leading-relaxed text-center" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                            "{targetCharacter?.hint || 'No hint available'}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Game Area */}
                    <div className="w-full max-w-4xl px-4 flex flex-col items-center z-10">

                        {!hasWon && (
                            <SearchBar
                                onGuess={handleGuess}
                                guessedIds={guesses.map(g => g.id)}
                                disabled={hasWon}
                            />
                        )}

                        <GuessGrid guesses={guesses} />

                        {/* Footer - Blood Clock & Forbidden Button */}
                        <footer className="mt-12 py-6 text-center border-t border-red-900/30 w-full">
                            <p className="text-gray-500 text-sm mb-2 uppercase tracking-widest font-serif">Next Apostle arrives in:</p>
                            <p className="text-2xl font-mono text-red-500 font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)]" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>{timeRemaining}</p>

                            <button
                                onClick={handleDevReset}
                                className="mt-6 bg-red-950/30 hover:bg-red-950/50 border-2 border-red-900/50 hover:border-red-800/70 text-red-800 hover:text-red-400 px-3 py-1.5 rounded text-[10px] transition-all cursor-pointer shadow-[0_0_10px_rgba(127,29,29,0.3)] hover:shadow-[0_0_15px_rgba(127,29,29,0.6)] uppercase tracking-wider font-bold"
                            >
                                ⚠ Dev Reset ⚠
                            </button>
                            <p className="text-gray-700 text-[10px] mt-2">Unofficial Fan Game. Berserk is © Kentaro Miura.</p>
                        </footer>
                    </div>
                </div>
            </div >
        </>
    );
}

export default ClassicMode;
