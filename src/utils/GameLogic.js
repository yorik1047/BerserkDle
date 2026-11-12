import characters from '../../berserk_chars.json';

// Get the daily character based on the current date string
export const getDailyCharacter = () => {
    // Create a seed from current date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Simple hash function to generate a pseudo-random index
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    const index = Math.abs(hash) % characters.length;
    return characters[index];
};

// Deterministic daily game number (#1 = 2026-01-10 UTC)
export const getDailyNumber = () => {
    const epoch = Date.UTC(2026, 0, 10);
    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return Math.max(1, Math.floor((todayUtc - epoch) / (1000 * 60 * 60 * 24)) + 1);
};

// Convert a single Classic guess result object into a 6-cell spoiler-free emoji row
export const guessToEmojiRow = (guess) => {
    if (!guess) return '';

    const boolEmoji = (attr) => {
        if (attr?.partial) return '🟨';
        return attr?.match ? '🟩' : '🟥';
    };

    const dirEmoji = (attr) => {
        if (attr?.match) return '🟩';
        if (attr?.partial) return '🟨';
        if (attr?.direction === 'up') return '⬆️';
        if (attr?.direction === 'down') return '⬇️';
        return '🟥';
    };

    const statureAttr = guess.stature || guess.height_cm;

    return [
        boolEmoji(guess.gender),
        boolEmoji(guess.species),
        boolEmoji(guess.affiliation),
        dirEmoji(guess.debut_arc),
        boolEmoji(guess.hair_color),
        dirEmoji(statureAttr),
    ].join('');
};

// Build full spoiler-free share text for Classic ("The Struggle") mode
export const buildClassicShareText = (guesses = []) => {
    const dayNumber = getDailyNumber();
    const count = guesses.length;
    const attemptLabel = count === 1 ? 'Attempt' : 'Attempts';
    const emojiGrid = guesses.map(guessToEmojiRow).join('\n');

    return `BerserkDle #${dayNumber} - ${count} ${attemptLabel}\n${emojiGrid}\nPlay at: https://berserk-dle.vercel.app/`;
};

// Copy text to clipboard with fallback support
export const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        return true;
    } finally {
        document.body.removeChild(textArea);
    }
};

export const ARC_ORDER = [
    "Black Swordsman Arc",
    "Golden Age Arc",
    "Conviction Arc",
    "Millennium Falcon Arc",
    "Fantasia Arc"
];

export const STATURE_ORDER = [
    "Tiny",
    "Small",
    "Average",
    "Tall",
    "Massive",
    "Colossal"
];

const getArcDirection = (guessArc, targetArc) => {
    const guessIndex = ARC_ORDER.indexOf(guessArc);
    const targetIndex = ARC_ORDER.indexOf(targetArc);

    if (guessIndex === -1 || targetIndex === -1) return 'equal';
    if (guessIndex < targetIndex) return 'up'; // Target is later
    if (guessIndex > targetIndex) return 'down'; // Target is earlier
    return 'equal';
};

const compareStature = (guessStature, targetStature) => {
    const guessIndex = STATURE_ORDER.indexOf(guessStature);
    const targetIndex = STATURE_ORDER.indexOf(targetStature);

    if (guessIndex === -1 || targetIndex === -1) {
        const isMatch = guessStature === targetStature;
        return {
            value: guessStature || '-',
            match: isMatch,
            partial: false,
            direction: 'equal'
        };
    }

    const diff = targetIndex - guessIndex;
    return {
        value: guessStature,
        match: diff === 0,
        partial: Math.abs(diff) === 1,
        direction: diff > 0 ? 'up' : (diff < 0 ? 'down' : 'equal')
    };
};

export const compareAttributes = (guess, target) => {
    return {
        id: guess.id,
        name: {
            value: guess.name,
            match: guess.id === target.id
        },
        gender: {
            value: guess.gender,
            match: guess.gender === target.gender
        },
        species: {
            value: guess.species,
            match: guess.species === target.species
        },
        affiliation: {
            value: guess.affiliation,
            match: guess.affiliation === target.affiliation
        },
        debut_arc: {
            value: guess.debut_arc,
            match: guess.debut_arc === target.debut_arc,
            direction: getArcDirection(guess.debut_arc, target.debut_arc)
        },
        hair_color: {
            value: guess.hair_color,
            match: guess.hair_color === target.hair_color
        },
        stature: compareStature(guess.stature, target.stature),
        image_url: guess.image_url
    };
};
