import React from "react";

const WinModal = ({ character, onClose, nextCharacterTime }) => {
    // Захист: якщо персонаж не переданий, не показуємо помилку
    if (!character) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[101] bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-gray-900 border-2 border-red-700 p-8 rounded-lg max-w-md w-full text-center relative shadow-[0_0_30px_rgba(139,0,0,0.3)]">

                <h2 className="text-3xl font-bold text-green-500 mb-4 font-serif tracking-wider">
                    YOU WON!
                </h2>

                <p className="text-gray-300 mb-6 text-lg">
                    The character was <span className="text-white font-bold">{character.name}</span>.
                </p>

                {/* Таймер зворотного відліку */}
                {nextCharacterTime && (
                    <div className="mb-6 p-3 bg-black/60 rounded border border-red-900/50">
                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Next Character In:</p>
                        <p className="text-2xl font-mono text-red-500 font-bold">{nextCharacterTime}</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-red-900 hover:bg-red-800 text-white font-bold rounded transition-colors uppercase tracking-wider border border-red-700 text-sm"
                >
                    CLOSE
                </button>
            </div>
        </div>
    );
};

export default WinModal;