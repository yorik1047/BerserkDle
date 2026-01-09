import { useState, useEffect } from 'react';
import characters from '../../berserk_chars.json';

const SearchBar = ({ onGuess, guessedIds, disabled }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (query.length > 0) {
            const filtered = characters.filter(c =>
                c.name.toLowerCase().includes(query.toLowerCase()) &&
                !guessedIds.includes(c.id)
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [query, guessedIds]);

    const handleSelect = (character) => {
        onGuess(character);
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-full max-w-md mx-auto mb-8 z-50">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Guess a character..."
                disabled={disabled}
                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:outline-none focus:border-berserk-red focus:shadow-[0_0_10px_#8a0303] placeholder-gray-500 transition-all font-serif text-lg"
            />

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute w-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {suggestions.map((char) => (
                        <li
                            key={char.id}
                            onClick={() => handleSelect(char)}
                            className="px-4 py-2 hover:bg-berserk-red hover:text-white cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-800 last:border-b-0"
                        >
                            <img
                                src={char.image_url}
                                alt={char.name}
                                onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg'; }}
                                className="w-8 h-8 rounded-full object-cover bg-gray-700"
                            />
                            <span className="font-serif">{char.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
