import React from 'react';

// Допоміжна функція для правильних шляхів на GitHub Pages
const resolvePath = (path) => {
    // Якщо шляху немає або це undefined
    if (!path) return `${import.meta.env.BASE_URL}images/placeholder.jpg`;
    // Якщо це повне посилання на інтернет (http/https)
    if (path.startsWith('http')) return path;

    // Видаляємо скісну риску на початку, щоб уникнути подвійних слешів (//)
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // Об'єднуємо з базовим шляхом (наприклад, /BerserkDle/)
    return `${import.meta.env.BASE_URL}${cleanPath}`;
};

const GuessRow = ({ guess, delay }) => {
    const cellClass = (match) => `
        flex items-center justify-center p-2 text-center text-sm md:text-base border-2 border-gray-800 rounded
        transition-all duration-500 flip-animate
        ${match ? 'bg-green-700 border-green-500' : 'bg-red-900/50 border-berserk-red'}
    `;

    return (
        <div className="grid grid-cols-8 gap-2 mb-2 animate-fadeIn" style={{ animationDelay: `${delay}ms` }}>
            {/* Character Info */}
            <div className="flex flex-col items-center justify-center p-2 border-2 border-gray-700 bg-gray-800 rounded">
                <img
                    // ✅ ВИПРАВЛЕНО: Використовуємо функцію для правильного шляху
                    src={resolvePath(guess.image_url)}
                    alt={guess.name.value}
                    onError={(e) => {
                        e.target.onerror = null;
                        // ✅ ВИПРАВЛЕНО: Правильний шлях до placeholder
                        e.target.src = `${import.meta.env.BASE_URL}images/placeholder.jpg`;
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover mb-1 border border-gray-600"
                />
                <span className="text-xs font-bold leading-tight truncate w-full text-center">{guess.name.value}</span>
            </div>

            {/* Attributes */}
            <div className={cellClass(guess.gender.match)}>
                {guess.gender.value}
            </div>

            <div className={cellClass(guess.species.match)}>
                <span className="text-xs">{guess.species.value}</span>
            </div>

            <div className={cellClass(guess.affiliation.match)}>
                <span className="text-[10px] md:text-xs">{guess.affiliation.value}</span>
            </div>

            <div className={cellClass(guess.debut_arc?.match ?? false)}>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] md:text-xs leading-tight">{guess.debut_arc?.value || '-'}</span>
                    {!guess.debut_arc?.match && guess.debut_arc?.direction && guess.debut_arc.direction !== 'equal' && (
                        <span className="text-lg font-bold">
                            {guess.debut_arc.direction === 'up' ? '↑' : '↓'}
                        </span>
                    )}
                </div>
            </div>

            <div className={cellClass(guess.hair_color.match)}>
                {guess.hair_color.value}
            </div>

            <div className={cellClass(guess.height_cm.match)}>
                <div className="flex flex-col items-center">
                    <span>{guess.height_cm.value}</span>
                    {!guess.height_cm.match && (
                        <span className="text-xl font-bold">
                            {guess.height_cm.direction === 'up' ? '↑' : '↓'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const GuessGrid = ({ guesses }) => {
    // Якщо здогадок немає, нічого не рендеримо
    if (!guesses || guesses.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mx-auto px-2">
            {/* Header */}
            <div className="grid grid-cols-8 gap-2 mb-4 text-center text-gray-400 text-xs md:text-sm font-serif uppercase tracking-wider">
                <div>Character</div>
                <div>Gender</div>
                <div>Species</div>
                <div>Affiliation</div>
                <div>Debut Arc</div>
                <div>Hair</div>
                <div>Height</div>
            </div>

            {/* Rows */}
            <div className="flex flex-col-reverse">
                {guesses.map((guess, index) => (
                    <GuessRow key={index} guess={guess} delay={index * 100} />
                ))}
            </div>
        </div>
    );
};

export default GuessGrid;