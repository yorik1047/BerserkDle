function InfoModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#0a0a0a] border-double border-4 border-red-900/40 rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-500 hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.6)] transition-all duration-300 text-xl font-bold"
                    aria-label="Close"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="border-b border-red-900/30 px-8 py-6">
                    <h2 className="font-serif font-black text-red-500 text-3xl uppercase tracking-widest text-center">
                        How To Play
                    </h2>
                    <p className="text-gray-500 text-center text-sm mt-2 italic">
                        Master the ancient art of guessing...
                    </p>
                </div>

                {/* Content */}
                <div className="px-8 py-6 space-y-6 text-gray-400">

                    {/* Objective */}
                    <div>
                        <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                            <span>⚔️</span> Objective
                        </h3>
                        <p className="leading-relaxed">
                            Guess the daily character in as few attempts as possible. Each guess reveals clues about the mystery character.
                        </p>
                    </div>

                    {/* How It Works */}
                    <div>
                        <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                            <span>🌑</span> How It Works
                        </h3>
                        <ul className="space-y-2 leading-relaxed">
                            <li className="flex items-start gap-2">
                                <span className="text-gray-600 mt-1">▸</span>
                                <span>Type a character name in the search box</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-600 mt-1">▸</span>
                                <span>Submit your guess to see attribute comparisons</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-600 mt-1">▸</span>
                                <span>Use the clues to narrow down your next guess</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-gray-600 mt-1">▸</span>
                                <span>After 15 attempts, you can unlock a hint</span>
                            </li>
                        </ul>
                    </div>

                    {/* Color Guide */}
                    <div>
                        <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                            <span>✦</span> Color Guide
                        </h3>
                        <div className="space-y-3">
                            {/* Correct Match */}
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-900/80 border-2 border-emerald-500 px-4 py-2 rounded shadow-[0_0_15px_rgba(16,185,129,0.4)] min-w-[100px] text-center">
                                    <span className="text-emerald-100 font-bold text-sm">Correct</span>
                                </div>
                                <span className="text-sm">Exact match with the mystery character</span>
                            </div>

                            {/* Incorrect Match */}
                            <div className="flex items-center gap-3">
                                <div className="bg-red-950/80 border-2 border-red-900 px-4 py-2 rounded min-w-[100px] text-center">
                                    <span className="text-red-200 font-bold text-sm">Incorrect</span>
                                </div>
                                <span className="text-sm">Does not match the mystery character</span>
                            </div>

                            {/* Higher/Lower */}
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-900/80 border-2 border-amber-600/50 px-4 py-2 rounded min-w-[100px] text-center">
                                    <span className="text-amber-400 font-bold text-sm">↑ Higher</span>
                                </div>
                                <span className="text-sm">The actual value is higher (for numeric attributes)</span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="bg-gray-900/80 border-2 border-amber-600/50 px-4 py-2 rounded min-w-[100px] text-center">
                                    <span className="text-amber-400 font-bold text-sm">↓ Lower</span>
                                </div>
                                <span className="text-sm">The actual value is lower (for numeric attributes)</span>
                            </div>
                        </div>
                    </div>

                    {/* Attributes */}
                    <div>
                        <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                            <span>📜</span> Attributes
                        </h3>
                        <p className="leading-relaxed mb-2">
                            Each guess compares these attributes:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-900/30 border border-gray-800 px-3 py-2 rounded">
                                <span className="text-gray-500">Name</span>
                            </div>
                            <div className="bg-gray-900/30 border border-gray-800 px-3 py-2 rounded">
                                <span className="text-gray-500">Gender</span>
                            </div>
                            <div className="bg-gray-900/30 border border-gray-800 px-3 py-2 rounded">
                                <span className="text-gray-500">Race</span>
                            </div>
                            <div className="bg-gray-900/30 border border-gray-800 px-3 py-2 rounded">
                                <span className="text-gray-500">Affiliation</span>
                            </div>
                            <div className="bg-gray-900/30 border border-gray-800 px-3 py-2 rounded">
                                <span className="text-gray-500">First Appearance</span>
                            </div>
                            <div className="bg-gray-900/30 border border-gray-800 px-3 py-2 rounded">
                                <span className="text-gray-500">Status</span>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div>
                        <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                            <span>🗡️</span> Tips
                        </h3>
                        <ul className="space-y-2 leading-relaxed text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">◆</span>
                                <span>Start with well-known characters to narrow down categories</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">◆</span>
                                <span>Pay attention to numeric clues (arrows) for appearance dates</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-600 mt-1">◆</span>
                                <span>A new character appears each day at midnight</span>
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-red-900/20 pt-4 mt-6">
                        <p className="text-gray-600 text-xs text-center italic">
                            May the Brand guide your guesses...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoModal;
