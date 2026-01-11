import React, { useState, useEffect, useRef } from 'react';
// 👇 ВИПРАВЛЕНО: Шлях ../../ веде з src/components/ прямо в корінь проекту
import characterData from '../../berserk_chars.json';

const SearchBar = ({ onGuess, guessedIds, disabled }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef(null);

    // Закриваємо список при кліку назовні
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Пошук та фільтрація
    useEffect(() => {
        if (query.length > 0) {
            const filtered = characterData.filter(char => {
                const isAlreadyGuessed = guessedIds.includes(char.id);
                const matchesName = char.name.toLowerCase().includes(query.toLowerCase());
                return !isAlreadyGuessed && matchesName;
            });
            setSuggestions(filtered.slice(0, 5)); // Показуємо топ-5
        } else {
            setSuggestions([]);
        }
    }, [query, guessedIds]);

    const handleSelect = (character) => {
        onGuess(character);
        setQuery('');
        setSuggestions([]);
        setIsFocused(false);
    };

    // 🔥 ФІЧА: Натискання ENTER вибирає першого у списку
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && suggestions.length > 0) {
            e.preventDefault();
            handleSelect(suggestions[0]); // Вибираємо найпершого персонажа
        }
    };

    if (disabled) return null;

    return (
        <div className="relative w-full max-w-md mb-6 z-50" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsFocused(true);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown} // 👈 Підключили Enter
                    placeholder="Type a character name..."
                    className="w-full p-4 pl-12 bg-gray-900/80 border-2 border-gray-600 rounded text-white placeholder-gray-500 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 transition-all font-serif tracking-wider shadow-lg backdrop-blur-sm"
                    disabled={disabled}
                />
                <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>

            {/* Випадаючий список */}
            {isFocused && suggestions.length > 0 && (
                <ul className="absolute w-full bg-gray-900 border-2 border-gray-600 mt-2 rounded shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-gray-800">
                    {suggestions.map((char, index) => (
                        <li
                            key={char.id}
                            onClick={() => handleSelect(char)}
                            // Додаємо підсвітку для першого елемента
                            className={`p-3 cursor-pointer transition-colors flex items-center gap-3
                                ${index === 0 ? 'bg-red-900/20 hover:bg-red-900/40 border-l-4 border-red-600' : 'hover:bg-gray-800'}
                            `}
                        >
                            <div className="w-8 h-8 rounded bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-700">
                                <img
                                    src={char.image_url || '/images/placeholder.jpg'}
                                    alt={char.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg' }}
                                />
                            </div>

                            <div className="flex flex-col w-full">
                                <span className="font-bold text-gray-200 flex justify-between items-center">
                                    {char.name}
                                    {/* Підказка "Enter" біля першого */}
                                    {index === 0 && (
                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest border border-gray-600 px-1 rounded bg-black/40">
                                            ↵ Enter
                                        </span>
                                    )}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;