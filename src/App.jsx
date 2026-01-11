import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import GuessGrid from './components/GuessGrid';
import InfoModal from './components/InfoModal';
import WinModal from './components/WinModal';
import GrimParticles from './components/GrimParticles';
import { getDailyCharacter, compareAttributes } from './utils/GameLogic';
import BerserkConfetti from './components/BerserkConfetti';

function App() {
    const [targetCharacter, setTargetCharacter] = useState(null);
    const [guesses, setGuesses] = useState([]);
    const [hasWon, setHasWon] = useState(false);
    const [streak, setStreak] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [showWin, setShowWin] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        // 1. Завантаження персонажа
        const dailyTarget = getDailyCharacter();
        setTargetCharacter(dailyTarget);

        // 2. Перевірка збереженого стану
        const todayStr = new Date().toISOString().split('T')[0];
        const savedState = JSON.parse(localStorage.getItem('berserkdle_state') || '{}');
        const savedStreak = parseInt(localStorage.getItem('berserkdle_streak') || '0');

        setStreak(savedStreak);

        if (savedState.date === todayStr) {
            setGuesses(savedState.guesses || []);
            setHasWon(savedState.won || false);
            if (savedState.won) {
                setShowWin(true);
            }
        } else {
            localStorage.removeItem('berserkdle_state');
        }

        // 3. Інтро для новачків
        const introSeen = localStorage.getItem('berserkdle_intro_seen');
        if (!introSeen) {
            setShowInfo(true);
            localStorage.setItem('berserkdle_intro_seen', 'true');
        }

        // 4. Таймер
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

        // Збереження прогресу
        localStorage.setItem('berserkdle_state', JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            guesses: newGuesses,
            won: isWin
        }));
    };

    return (
        // 🔥 ВИКОРИСТОВУЄМО ФРАГМЕНТ (<> ... </>)
        <>
            {/* 1. Фонові ефекти (Попіл + Клеймо Жертви) */}
            {hasWon && <GrimParticles />}
            {hasWon && <BerserkConfetti />} {/* ✅ ДОДАНО ТУТ */}

            {/* 2. Головний контейнер сайту */}
            <div className="text-white min-h-screen flex flex-col items-center py-10 font-serif relative overflow-x-hidden">

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

                {/* Header */}
                <header className="w-full max-w-4xl px-4 flex justify-between items-center mb-6 z-10">
                    <div className="w-8"></div>

                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold text-berserk-red mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-widest uppercase">
                            BerserkDle
                        </h1>
                        <p className="text-gray-500 italic tracking-wide">Daily Character Guessing Game</p>
                    </div>

                    <button
                        onClick={() => setShowInfo(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-all font-bold"
                        aria-label="How to Play"
                    >
                        ?
                    </button>
                </header>

                {/* Stats */}
                <div className="mb-6 flex gap-8 text-sm text-gray-400 z-10">
                    <div className="flex flex-col items-center">
                        <span className="font-bold text-xl text-white">{streak}</span>
                        <span>Streak</span>
                    </div>
                </div>

                {/* Game Area */}
                <div className="w-full max-w-4xl px-4 flex flex-col items-center z-10">

                    {/* Guess Counter */}
                    <div className="mb-4 text-gray-400 font-serif text-sm uppercase tracking-widest">
                        Attempt: <span className="text-berserk-red font-bold text-lg">{guesses.length + 1}</span>
                    </div>

                    {!hasWon && (
                        <SearchBar
                            onGuess={handleGuess}
                            guessedIds={guesses.map(g => g.id)}
                            disabled={hasWon}
                        />
                    )}

                    <GuessGrid guesses={guesses} />

                    {/* Footer Timer */}
                    <footer className="mt-12 py-6 text-center border-t border-red-900/30 w-full">
                        <p className="text-gray-500 text-sm mb-2 uppercase tracking-widest">Next Apostle arrives in:</p>
                        <p className="text-xl font-mono text-red-600 font-bold">{timeRemaining}</p>

                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="mt-6 bg-red-900/10 hover:bg-red-900/30 border border-red-900/30 text-red-800 hover:text-red-500 px-2 py-1 rounded text-[10px] transition-colors cursor-pointer"
                        >
                            Dev Reset
                        </button>
                        <p className="text-gray-700 text-[10px] mt-2">Unofficial Fan Game. Berserk is © Kentaro Miura.</p>
                    </footer>
                </div>
            </div>
        </>
    );
}

export default App;