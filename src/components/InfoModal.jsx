import React from 'react';

const InfoModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fadeIn">
            <div className="bg-gray-900 border-2 border-berserk-red max-w-2xl w-full rounded-lg shadow-[0_0_20px_rgba(138,3,3,0.5)] p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-900 border border-berserk-red text-white hover:bg-berserk-red px-3 py-1 rounded font-serif transition-colors"
                >
                    X
                </button>

                <h2 className="text-3xl font-bold text-berserk-red text-center mb-6 font-serif uppercase tracking-widest border-b border-gray-800 pb-4">
                    How to Play
                </h2>

                <div className="text-gray-300 space-y-4 font-serif text-sm md:text-base">
                    <p>Guess the hidden Berserk character for the day.</p>

                    <div>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><span className="text-green-400 font-bold">Green:</span> Exact match.</li>
                            <li><span className="text-red-400 font-bold">Red:</span> Incorrect match.</li>
                            <li>
                                <span className="font-bold text-white">Arrows (↑/↓):</span> Indicate if the correct answer is
                                <span className="italic"> Higher/Lower</span> (for Height) or
                                <span className="italic"> Later/Earlier</span> in the story (for Debut Arc).
                            </li>
                        </ul>
                    </div>

                    <div className="my-6 border-t border-b border-gray-800 py-4">
                        <h3 className="text-lg font-bold text-white mb-2">Example</h3>
                        <p className="mb-2 text-xs text-gray-400">Target Character: <span className="text-berserk-red font-bold">Guts (204cm)</span></p>

                        {/* Mock Header */}
                        <div className="grid grid-cols-4 gap-1 md:gap-2 text-[10px] md:text-xs text-center uppercase text-gray-500 mb-1">
                            <div>Character</div>
                            <div>Gender</div>
                            <div>Debut</div>
                            <div>Height</div>
                        </div>

                        {/* Mock Row */}
                        <div className="grid grid-cols-4 gap-1 md:gap-2 text-center text-[10px] md:text-sm">
                            {/* Char */}
                            <div className="bg-gray-800 border-2 border-gray-700 p-1 rounded flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-600 mb-1 overflow-hidden">
                                    <img src="/images/placeholder.jpg" alt="Example" className="w-full h-full object-cover" />
                                </div>
                                <span>Judeau</span>
                            </div>

                            {/* Gender - Match */}
                            <div className="bg-green-700 border-2 border-green-500 p-1 rounded flex items-center justify-center">
                                Male
                            </div>

                            {/* Debut - Wrong (Earlier) */}
                            <div className="bg-red-900/50 border-2 border-berserk-red p-1 rounded flex flex-col items-center justify-center">
                                <span>Golden Age</span>
                                <span className="text-lg font-bold">↓</span>
                            </div>

                            {/* Height - Wrong (Taller) */}
                            <div className="bg-red-900/50 border-2 border-berserk-red p-1 rounded flex flex-col items-center justify-center">
                                <span>160cm</span>
                                <span className="text-lg font-bold">↑</span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs italic text-gray-500">
                            (↑) = Target is Taller / Later Arc. <br />
                            (↓) = Target is Shorter / Earlier Arc.
                        </p>
                    </div>

                    <p className="text-center text-gray-400 text-xs">A new character is chosen available every day!</p>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
