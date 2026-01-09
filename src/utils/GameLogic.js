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
        height_cm: { 
            value: guess.height_cm, 
            match: guess.height_cm === target.height_cm,
            direction: guess.height_cm < target.height_cm ? 'up' : (guess.height_cm > target.height_cm ? 'down' : 'equal')
        },
        image_url: guess.image_url
    };
};

const ARC_ORDER = [
    "Black Swordsman Arc", 
    "Golden Age Arc", 
    "Conviction Arc", 
    "Millennium Falcon Arc", 
    "Fantasia Arc"
];

const getArcDirection = (guessArc, targetArc) => {
    const guessIndex = ARC_ORDER.indexOf(guessArc);
    const targetIndex = ARC_ORDER.indexOf(targetArc);

    if (guessIndex === -1 || targetIndex === -1) return 'equal';
    if (guessIndex < targetIndex) return 'up'; // Target is later
    if (guessIndex > targetIndex) return 'down'; // Target is earlier
    return 'equal';
};
