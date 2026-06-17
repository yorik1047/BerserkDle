import React, { useState, useEffect } from 'react';

const calculateTimeLeft = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    if (diff <= 0) return '00:00:00';

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
    const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
    const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

/**
 * CountdownTimer
 * Displays time remaining until local midnight (next daily character).
 * Props:
 *   accentColor — Tailwind color token used for the time digits, e.g. 'red' | 'purple'
 */
const CountdownTimer = ({ accentColor = 'red' }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Map accent colors to concrete Tailwind classes to avoid purge issues
    const labelClass = accentColor === 'purple'
        ? 'text-purple-700 text-[10px] uppercase tracking-[0.3em]'
        : 'text-red-700 text-[10px] uppercase tracking-[0.3em]';

    const timeClass = accentColor === 'purple'
        ? 'text-2xl font-mono text-purple-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]'
        : 'text-2xl font-mono text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]';

    const borderClass = accentColor === 'purple'
        ? 'border-purple-900/30'
        : 'border-red-900/30';

    const bgClass = accentColor === 'purple'
        ? 'bg-purple-950/10'
        : 'bg-red-950/10';

    return (
        <div className={`w-full ${bgClass} border-y ${borderClass} p-6 flex flex-col items-center gap-2 backdrop-blur-md`}>
            <p className={labelClass}>Next character in</p>
            <p className={timeClass}>{timeLeft}</p>
        </div>
    );
};

export default CountdownTimer;
