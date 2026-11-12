import React from "react";
import { getDailyNumber, guessToEmojiRow } from "../utils/GameLogic";

const WinModal = ({ character, guesses = [], guessCount, onClose, onShare, nextCharacterTime }) => {
    // Захист: якщо персонаж не переданий, не показуємо помилку
    if (!character) return null;

    const totalAttempts = guesses.length || guessCount || 0;
    const dayNumber = getDailyNumber();

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[101] bg-black/85 backdrop-blur-sm p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-[#0d0d0f] border-2 border-red-800/80 p-6 sm:p-8 rounded-lg max-w-md w-full text-center relative shadow-[0_0_40px_rgba(139,0,0,0.35)]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors text-lg font-bold cursor-pointer"
                >
                    ✕
                </button>

                <p className="text-[10px] uppercase tracking-[0.35em] text-amber-500/80 mb-1 font-serif">
                    BerserkDle #{dayNumber}
                </p>

                <h2 className="text-3xl font-bold text-emerald-400 mb-3 font-serif tracking-wider">
                    YOU WON!
                </h2>

                <p className="text-gray-300 mb-5 text-base sm:text-lg">
                    The character was <span className="text-white font-bold">{character.name}</span>{" "}
                    <span className="text-gray-400 text-sm">({totalAttempts} {totalAttempts === 1 ? "Attempt" : "Attempts"})</span>
                </p>

                {/* Spoiler-Free Emoji Grid Preview */}
                {guesses.length > 0 && (
                    <div className="mb-5 py-3 px-4 bg-black/60 border border-stone-800 rounded max-h-40 overflow-y-auto">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">
                            Your Struggle
                        </p>
                        <div className="font-mono text-base sm:text-lg leading-snug tracking-widest select-all space-y-0.5">
                            {guesses.map((g, i) => (
                                <div key={i}>{guessToEmojiRow(g)}</div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Prominent Share Result CTA */}
                <button
                    onClick={onShare}
                    className="w-full mb-5 py-3.5 px-6 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-black font-serif font-black rounded border border-amber-400/70 shadow-[0_0_20px_rgba(217,119,6,0.35)] hover:shadow-[0_0_28px_rgba(245,158,11,0.55)] transition-all duration-200 uppercase tracking-[0.22em] text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                    <span>📋</span>
                    <span>Share Result</span>
                </button>

                {/* Таймер зворотного відліку */}
                {nextCharacterTime && (
                    <div className="mb-5 p-3 bg-black/60 rounded border border-red-900/40">
                        <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">Next Character In:</p>
                        <p className="text-2xl font-mono text-red-500 font-bold">{nextCharacterTime}</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-stone-900 hover:bg-red-950/60 text-gray-300 hover:text-white font-bold rounded transition-colors uppercase tracking-wider border border-stone-700 hover:border-red-800/70 text-xs cursor-pointer"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default WinModal;
