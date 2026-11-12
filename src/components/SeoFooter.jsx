import React from 'react';

const SeoFooter = () => {
    return (
        <footer className="relative z-10 mt-auto w-full bg-[#050505]/95 border-t border-neutral-900 text-neutral-500 font-serif">
            <section
                aria-label="About BerserkDle and Game Modes"
                className="max-w-5xl mx-auto px-6 py-10"
            >
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-950/60 to-transparent mx-auto mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
                    <div className="space-y-3">
                        <h2 className="text-neutral-400 font-bold uppercase tracking-[0.2em] text-xs">
                            What is BerserkDle?
                        </h2>
                        <p>
                            BerserkDle is a free daily Wordle-inspired trivia and character guessing game set in Kentaro Miura&apos;s legendary dark fantasy Berserk manga and anime universe. Built for dedicated strugglers and newcomers alike, the game challenges your lore mastery across the Golden Age, Conviction, Falcon of the Millennium Empire, and Fantasia arcs. From iconic warriors like Guts, Griffith, and Casca to fearsome immortals like Nosferatu Zodd and the God Hand, every puzzle tests how well you know Midland and the Astral World.
                        </p>
                        <p>
                            A new mystery apostle or character arrives daily at midnight across all three modes, giving fans a fresh Berserk puzzle to solve, build winning streaks, and share spoiler-free results every single day.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-neutral-400 font-bold uppercase tracking-[0.2em] text-xs">
                            How to Play the 3 Game Modes
                        </h2>
                        <p>
                            Choose from three distinct daily challenges designed to test different aspects of your Berserk knowledge:
                        </p>
                        <ul className="list-disc pl-4 space-y-2 marker:text-red-950">
                            <li>
                                <strong className="text-neutral-400 font-semibold">The Struggle (Classic Attribute Guessing):</strong> Enter any character name to compare key attributes including gender, species, affiliation, debut arc, hair color, and stature, using color-coded clues and directional arrows to narrow down the answer.
                            </li>
                            <li>
                                <strong className="text-neutral-400 font-semibold">The Eclipse (Silhouette Mode):</strong> Face the darkness and identify the hidden character from a shadowy silhouette outline that sharpens into focus with each incorrect guess.
                            </li>
                            <li>
                                <strong className="text-neutral-400 font-semibold">The Astral (Emoji Divination):</strong> Read the astral signs by decoding a sequence of four symbolic emojis, unlocking additional icons and lore whispers as you search for the right name.
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </footer>
    );
};

export default SeoFooter;
