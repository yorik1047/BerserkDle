import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

const MODES = [
    {
        path: '/classic',
        label: 'The Struggle',
        icon: '⚔️',
        storageKey: 'berserkdle_state',
        activeClass: 'bg-amber-950/45 border-amber-500/60 text-amber-200 shadow-[0_0_12px_rgba(217,119,6,0.2)]',
        inactiveClass: 'border-transparent text-stone-400 hover:text-amber-200/90 hover:bg-white/[0.04]',
    },
    {
        path: '/silhouette',
        label: 'The Eclipse',
        icon: '🌑',
        storageKey: 'berserkdle_silhouette_state',
        activeClass: 'bg-red-950/50 border-red-600/60 text-red-200 shadow-[0_0_12px_rgba(220,38,38,0.25)]',
        inactiveClass: 'border-transparent text-stone-400 hover:text-red-300 hover:bg-red-950/20',
    },
    {
        path: '/emoji',
        label: 'The Astral',
        icon: '🔮',
        storageKey: 'berserkdle_emoji_state',
        activeClass: 'bg-purple-950/50 border-purple-500/60 text-purple-200 shadow-[0_0_12px_rgba(139,92,246,0.25)]',
        inactiveClass: 'border-transparent text-stone-400 hover:text-purple-300 hover:bg-purple-950/20',
    },
];

const ModeSwitcher = ({ wonTrigger = false }) => {
    const location = useLocation();

    const completedMap = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const status = {};
        for (const mode of MODES) {
            try {
                const saved = JSON.parse(localStorage.getItem(mode.storageKey) || '{}');
                status[mode.path] = saved.date === todayStr && Boolean(saved.won);
            } catch {
                status[mode.path] = false;
            }
        }
        if (wonTrigger && location.pathname) {
            status[location.pathname] = true;
        }
        return status;
    }, [location.pathname, wonTrigger]);

    return (
        <nav
            aria-label="Quick Mode Switcher"
            className="w-full bg-black/75 backdrop-blur-md border-b border-white/[0.08] z-30 mb-6 sm:mb-8"
        >
            <div className="max-w-4xl mx-auto px-2 sm:px-4 h-12 flex items-center justify-center sm:justify-between gap-2">
                <Link
                    to="/"
                    className="hidden sm:inline-flex items-center text-xs font-serif font-black tracking-[0.22em] text-gray-300 hover:text-white uppercase transition-colors"
                >
                    BERSERK<span className="text-red-700">DLE</span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-2">
                    {MODES.map((mode) => {
                        const isActive = location.pathname === mode.path;
                        const isCompleted = completedMap[mode.path];

                        return (
                            <Link
                                key={mode.path}
                                to={mode.path}
                                aria-current={isActive ? 'page' : undefined}
                                className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 rounded border text-[10px] sm:text-xs font-serif uppercase tracking-wider sm:tracking-[0.16em] font-bold transition-all duration-200 whitespace-nowrap ${
                                    isActive ? mode.activeClass : mode.inactiveClass
                                }`}
                            >
                                <span className="text-[11px] sm:text-xs leading-none" aria-hidden="true">
                                    {mode.icon}
                                </span>
                                <span>{mode.label}</span>
                                {isCompleted && (
                                    <span
                                        title="Solved today"
                                        className="text-emerald-400 text-[10px] font-mono leading-none"
                                    >
                                        ✓
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default ModeSwitcher;
