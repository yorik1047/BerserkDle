import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import characterData from '../../berserk_chars.json';
import CountdownTimer from '../components/CountdownTimer';

// Filter to only characters that have emoji data
const emojiCharacters = characterData.filter(c => c.emojis);

const EmojiMode = () => {
    const [targetCharacter, setTargetCharacter] = useState(null);
    const [guess, setGuess] = useState('');
    const [hasWon, setHasWon] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [wrongGuesses, setWrongGuesses] = useState([]);
    const [shake, setShake] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isHintRevealed, setIsHintRevealed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (emojiCharacters.length === 0) return;

        // Daily deterministic pick from emoji-enabled characters
        const epoch = new Date("2024-01-01T00:00:00.000Z");
        const today = new Date();
        const diffTime = Math.abs(today - epoch);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const index = (diffDays + 77) % emojiCharacters.length;

        const todayStr = today.toISOString().split('T')[0];
        const savedState = JSON.parse(localStorage.getItem('berserkdle_emoji_state') || '{}');

        if (savedState.date === todayStr) {
            setTargetCharacter(emojiCharacters[index]);
            setAttempts(savedState.attempts || 0);
            setHasWon(savedState.won || false);
            setWrongGuesses(savedState.wrongGuesses || []);
            setIsHintRevealed(savedState.hintRevealed || false);
        } else {
            setTargetCharacter(emojiCharacters[index]);
            setIsHintRevealed(false);
            localStorage.removeItem('berserkdle_emoji_state');
        }
    }, []);

    const saveState = (newAttempts, won, newWrongGuesses, hintRevealed = isHintRevealed) => {
        localStorage.setItem('berserkdle_emoji_state', JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            attempts: newAttempts,
            won,
            wrongGuesses: newWrongGuesses,
            hintRevealed
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!targetCharacter || hasWon || !guess.trim()) return;

        // Strict validation: only accept names that exist in the database
        const matchedCharacter = characterData.find(
            c => c.name.toLowerCase() === guess.trim().toLowerCase()
        );
        if (!matchedCharacter) {
            setGuess('');
            return;
        }

        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        const isCorrect = matchedCharacter.name.toLowerCase() === targetCharacter.name.toLowerCase();

        if (isCorrect) {
            setHasWon(true);
            saveState(newAttempts, true, wrongGuesses);
        } else {
            const newWrong = [matchedCharacter.name, ...wrongGuesses];
            setWrongGuesses(newWrong);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            saveState(newAttempts, false, newWrong);
        }

        setGuess('');
    };

    // Autocomplete suggestions
    const suggestions = useMemo(() => {
        if (guess.trim().length < 1) return [];
        const q = guess.trim().toLowerCase();
        return characterData
            .filter(c => c.name.toLowerCase().includes(q))
            .filter(c => !wrongGuesses.map(w => w.toLowerCase()).includes(c.name.toLowerCase()))
            .slice(0, 5);
    }, [guess, wrongGuesses]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // If input already matches a valid character name exactly, let the form submit normally
            const exactMatch = characterData.find(
                c => c.name.toLowerCase() === guess.trim().toLowerCase()
            );
            if (exactMatch) return;

            // If there are suggestions, auto-select the first one and submit
            if (suggestions.length > 0) {
                e.preventDefault();
                const topSuggestion = suggestions[0];
                setGuess(topSuggestion.name);

                // Submit directly with the top suggestion's name
                if (!targetCharacter || hasWon) return;

                const newAttempts = attempts + 1;
                setAttempts(newAttempts);

                const isCorrect = topSuggestion.name.toLowerCase() === targetCharacter.name.toLowerCase();

                if (isCorrect) {
                    setHasWon(true);
                    saveState(newAttempts, true, wrongGuesses);
                } else {
                    const newWrong = [topSuggestion.name, ...wrongGuesses];
                    setWrongGuesses(newWrong);
                    setShake(true);
                    setTimeout(() => setShake(false), 500);
                    saveState(newAttempts, false, newWrong);
                }

                setGuess('');
            }
        }
    };

    if (!targetCharacter) {
        return (
            <div className="min-h-screen bg-[#050508] flex items-center justify-center">
                <div className="text-purple-500 animate-pulse font-serif tracking-widest uppercase text-sm">
                    Piercing the Astral Veil...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050508] relative overflow-x-hidden font-serif text-white selection:bg-purple-900 selection:text-white">

            {/* --- BACKGROUND LAYER --- */}
            <div className="fixed inset-0 z-0">
                {/* Astral void background image */}
                <img
                    src={`${import.meta.env.BASE_URL}images/astral_screen_bg.png`}
                    alt=""
                    className="w-full h-full object-cover"
                />
                {/* Dark purple-to-black gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/80 via-[#0d0520]/60 to-[#050508]/90"></div>
                {/* Ethereal orbs */}
                <div className="absolute inset-0"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(139,92,246,0.06) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.04) 0%, transparent 40%)' }}>
                </div>
                {/* Noise */}
                <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
                    style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")` }}>
                </div>
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_130%)]"></div>
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-10 flex flex-col items-center min-h-screen py-6">

                {/* HEADER */}
                <header className="w-full max-w-4xl px-4 flex justify-between items-start mb-12">
                    <Link to="/" className="text-gray-500 hover:text-purple-400 transition-colors flex items-center gap-2 group font-bold tracking-[0.2em] uppercase text-[10px]">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Escape
                    </Link>

                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-400 to-indigo-900 drop-shadow-[0_4px_10px_rgba(139,92,246,0.4)] tracking-[0.2em] uppercase text-center">
                            The Astral
                        </h1>
                        <p className="text-[9px] uppercase tracking-[0.4em] text-purple-500/50 mt-3 font-bold">
                            Emoji Divination
                        </p>
                    </div>

                    {/* Help Button */}
                    <button
                        onClick={() => setIsHelpOpen(true)}
                        aria-label="How to Play"
                        className="w-10 h-10 flex items-center justify-center border border-purple-900/40 rounded text-purple-700 hover:text-purple-300 hover:border-purple-500/60 hover:drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-300 font-bold text-lg flex-shrink-0"
                    >
                        ?
                    </button>
                </header>

                {/* MAIN GAME AREA */}
                <main className="flex flex-col items-center w-full max-w-lg px-4 flex-1">

                    {/* Emoji Display — The Oracle */}
                    <div className="relative mb-10">
                        {/* Glow behind */}
                        <div className={`absolute -inset-8 bg-gradient-to-b from-purple-600/20 to-indigo-900/10 rounded-3xl blur-2xl transition-opacity duration-1000 ${hasWon ? 'opacity-60 animate-pulse' : 'opacity-30'}`}></div>

                        <div className={`relative bg-black/40 border-2 ${hasWon ? 'border-purple-500/60' : 'border-purple-900/40'} backdrop-blur-sm rounded-2xl px-10 py-12 md:px-16 md:py-16 shadow-[0_0_60px_rgba(0,0,0,0.8)] transition-all duration-500 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                            {/* Decorative corners */}
                            <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-purple-700/40"></div>
                            <div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-purple-700/40"></div>
                            <div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-purple-700/40"></div>
                            <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-purple-700/40"></div>

                            <p className="text-5xl md:text-7xl tracking-[0.5em] text-center leading-relaxed select-none" style={{ textShadow: '0 4px 20px rgba(139,92,246,0.3)' }}>
                                {(() => {
                                    const emojiArr = Array.from(targetCharacter.emojis);
                                    const failCount = wrongGuesses.length;
                                    const revealCount = hasWon ? emojiArr.length : Math.min(failCount + 1, emojiArr.length);
                                    return emojiArr.map((emoji, i) => (
                                        <span key={i} className={i >= revealCount ? 'opacity-60 grayscale' : ''}>
                                            {i < revealCount ? emoji : '❓'}
                                        </span>
                                    ));
                                })()}
                            </p>
                        </div>
                    </div>

                    {/* Astral Whisper — Text Hint */}
                    {wrongGuesses.length >= 4 && !hasWon && (
                        <div className="mb-6 w-full flex flex-col items-center animate-[fadeInUp_0.6s_ease-out]">
                            {!isHintRevealed ? (
                                <button
                                    onClick={() => {
                                        setIsHintRevealed(true);
                                        saveState(attempts, hasWon, wrongGuesses, true);
                                    }}
                                    className="group relative px-8 py-3 bg-transparent border border-purple-800/50 rounded-lg text-purple-400 hover:text-purple-200 hover:border-purple-500/70 transition-all duration-500 text-xs uppercase tracking-[0.3em] font-bold cursor-pointer overflow-hidden"
                                >
                                    <span className="absolute inset-0 bg-gradient-to-r from-purple-900/0 via-purple-800/20 to-purple-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                                    <span className="relative flex items-center gap-2">
                                        <span className="text-base">👁️</span>
                                        Listen to the Astral Whisper
                                    </span>
                                </button>
                            ) : (
                                <div className="relative w-full max-w-md">
                                    <div className="absolute -inset-2 bg-purple-600/10 rounded-xl blur-xl animate-[whisperGlow_3s_ease-in-out_infinite]"></div>
                                    <div className="relative bg-black/50 border border-purple-700/40 rounded-xl px-6 py-4 backdrop-blur-sm">
                                        <p className="text-[9px] uppercase tracking-[0.4em] text-purple-600/60 mb-2 font-bold text-center">Astral Whisper</p>
                                        <p className="text-purple-300 italic text-center font-serif text-sm md:text-base leading-relaxed" style={{ textShadow: '0 0 20px rgba(168,85,247,0.4)' }}>
                                            "{targetCharacter.hint}"
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {isHintRevealed && hasWon && targetCharacter.hint && (
                        <div className="mb-6 w-full flex flex-col items-center">
                            <div className="relative w-full max-w-md">
                                <div className="relative bg-black/30 border border-purple-900/30 rounded-xl px-6 py-3 backdrop-blur-sm">
                                    <p className="text-purple-400/60 italic text-center font-serif text-xs leading-relaxed">
                                        "{targetCharacter.hint}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attempts Counter */}
                    <div className="mb-8 text-center">
                        <p className="text-purple-900/60 text-[9px] uppercase tracking-[0.4em] mb-2 font-bold">Astral Visions</p>
                        <p className="text-3xl font-bold text-purple-400 font-mono drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">{attempts}</p>
                    </div>

                    {/* GAME INPUT / WIN STATE */}
                    {hasWon ? (
                        <div className="flex flex-col items-center gap-8 w-full animate-[fadeInUp_0.8s_ease-out]">
                            {/* Victory Banner */}
                            <div className="w-full bg-gradient-to-r from-transparent via-purple-950/30 to-transparent border-y border-purple-500/30 py-8 backdrop-blur-md">
                                <h2 className="text-sm text-gray-500 uppercase tracking-[0.4em] mb-4 text-center">The Veil is Pierced</h2>
                                <p className="font-serif font-black text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-purple-400 via-purple-500 to-indigo-900 uppercase tracking-[0.3em] drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] text-center">
                                    {targetCharacter.name}
                                </p>
                            </div>
                            <CountdownTimer accentColor="purple" />
                            <div className="flex flex-col sm:flex-row gap-3 items-center">
                                <button
                                    onClick={() => {
                                        const shareText = `BerserkDle 🗡️\nMode: THE ASTRAL 🌌\nGuesses: ${attempts}\nPlay now: https://yorik1047.github.io/BerserkDle/`;
                                        navigator.clipboard.writeText(shareText).then(() => {
                                            setIsCopied(true);
                                            setTimeout(() => setIsCopied(false), 2000);
                                        });
                                    }}
                                    className={`group px-8 py-3 border text-xs tracking-[0.3em] uppercase rounded-sm transition-all duration-300 cursor-pointer ${
                                        isCopied
                                            ? 'bg-purple-600/30 border-purple-400/60 text-purple-200'
                                            : 'bg-gradient-to-r from-purple-950/50 via-indigo-950/50 to-purple-950/50 border-purple-700/50 text-purple-400 hover:bg-purple-900/40 hover:text-white hover:border-purple-500'
                                    }`}
                                >
                                    {isCopied ? 'Copied! ✓' : '📋 Share Result'}
                                </button>
                                <Link to="/" className="group px-8 py-3 bg-transparent border border-purple-700/50 text-purple-400 hover:bg-purple-900 hover:text-white hover:border-purple-500 transition-all text-xs tracking-[0.3em] uppercase rounded-sm">
                                    Return to Darkness
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-5">
                            {/* Input Form */}
                            <form onSubmit={handleSubmit} className="relative">
                                <div className="relative group">
                                    {/* Input glow */}
                                    <div className="absolute -inset-0.5 bg-purple-600/10 rounded-lg blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-500"></div>
                                    <input
                                        type="text"
                                        value={guess}
                                        onChange={(e) => setGuess(e.target.value)}
                                        placeholder="Speak the name..."
                                        className="relative w-full bg-black/60 border-2 border-purple-900/40 focus:border-purple-500/60 text-purple-100 placeholder-purple-800/50 px-6 py-4 rounded-lg text-lg font-serif tracking-wider outline-none transition-all duration-300 backdrop-blur-sm"
                                        autoComplete="off"
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>

                                {/* Autocomplete Dropdown */}
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-purple-900/40 rounded-lg overflow-hidden z-50 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
                                        {suggestions.map((char) => (
                                            <button
                                                key={char.id}
                                                type="button"
                                                onClick={() => {
                                                    setGuess(char.name);
                                                }}
                                                className="w-full px-5 py-3 text-left text-purple-200 hover:bg-purple-900/30 hover:text-white transition-colors text-sm font-serif tracking-wider border-b border-purple-900/20 last:border-b-0 cursor-pointer flex items-center"
                                            >
                                                <img
                                                    src={`${import.meta.env.BASE_URL}${char.image_url}`}
                                                    alt={char.name}
                                                    className="w-8 h-8 rounded-full object-cover mr-3 border border-gray-600 flex-shrink-0"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                                <span>{char.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!guess.trim()}
                                    className="mt-3 w-full bg-gradient-to-r from-purple-950/50 via-indigo-950/50 to-purple-950/50 hover:from-purple-900/60 hover:via-indigo-900/60 hover:to-purple-900/60 disabled:opacity-30 disabled:cursor-not-allowed border border-purple-700/40 hover:border-purple-500/60 text-purple-300 hover:text-white py-3 rounded-lg text-sm uppercase tracking-[0.3em] font-bold transition-all duration-300 cursor-pointer"
                                >
                                    Divine
                                </button>
                            </form>

                            {/* Wrong Guesses */}
                            {wrongGuesses.length > 0 && (
                                <div className="w-full mt-2 space-y-1 max-h-48 overflow-y-auto">
                                    <p className="text-purple-900/50 text-[9px] uppercase tracking-[0.3em] mb-2 font-bold text-center">Failed Visions</p>
                                    {wrongGuesses.map((wrong, idx) => {
                                        const charData = characterData.find(c => c.name.toLowerCase() === wrong.toLowerCase());
                                        return (
                                            <div key={idx} className="flex items-center gap-3 bg-black/30 border border-purple-900/20 px-4 py-2 rounded backdrop-blur-sm">
                                                <span className="text-red-900/60 text-xs flex-shrink-0">✕</span>
                                                {charData && (
                                                    <img
                                                        src={`${import.meta.env.BASE_URL}${charData.image_url}`}
                                                        alt={wrong}
                                                        className="w-7 h-7 rounded-full object-cover border border-purple-900/40 flex-shrink-0"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                )}
                                                <span className="text-sm text-purple-300/60 font-mono line-through">{wrong}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <p className="text-center text-[9px] text-gray-700 uppercase tracking-widest mt-4">
                                Read the signs. Name the soul.
                            </p>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-auto pt-8 pb-6 text-center">
                    <p className="text-gray-800 text-[10px]">Unofficial Fan Game. Berserk is © Kentaro Miura.</p>
                </footer>
            </div>

            {/* Shake animation keyframe */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes whisperGlow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.02); }
                }
            `}</style>

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
                        className="relative z-10 w-full max-w-md bg-[#0a0510] border border-purple-900/50 rounded-lg shadow-[0_0_60px_rgba(139,92,246,0.2)] p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative corners */}
                        <div className="absolute top-3 left-3 w-4 h-4 border-l border-t border-purple-700/50" />
                        <div className="absolute top-3 right-3 w-4 h-4 border-r border-t border-purple-700/50" />
                        <div className="absolute bottom-3 left-3 w-4 h-4 border-l border-b border-purple-700/50" />
                        <div className="absolute bottom-3 right-3 w-4 h-4 border-r border-b border-purple-700/50" />

                        {/* Close button */}
                        <button
                            onClick={() => setIsHelpOpen(false)}
                            aria-label="Close"
                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-purple-700 hover:text-purple-300 transition-colors text-lg font-bold"
                        >
                            ✕
                        </button>

                        <h2 className="text-purple-400 text-xs uppercase tracking-[0.4em] mb-6 font-bold text-center">How to Play</h2>

                        <p className="text-xs uppercase tracking-[0.3em] text-purple-300/80 font-bold mb-3 text-center">THE ASTRAL</p>
                        <p className="text-gray-400 text-sm leading-relaxed font-serif text-center">
                            Divine the character&#39;s identity by interpreting their astral signs (4 emojis).
                            Only the first sign is revealed — each wrong guess unveils the next.
                            After 3 failed visions, you may listen to an Astral Whisper for a lore hint.
                            Only valid character names will be accepted.
                        </p>

                        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-purple-900/50 to-transparent" />
                        <p className="text-purple-900/60 text-[10px] uppercase tracking-widest text-center mt-4">Read the signs. Name the soul.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmojiMode;
