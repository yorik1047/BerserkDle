import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const BerserkConfetti = () => {
    // Ініціалізація рушія частинок
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    // Формуємо правильний шлях до картинки (для GitHub Pages)
    const imagePath = `${import.meta.env.BASE_URL}images/berserk_mark.png`;

    return (
        <Particles
            id="tsparticles"
            className="fixed inset-0 z-[100] pointer-events-none" // z-100 щоб було над грою, але під модалкою (якщо вона z-101)
            init={particlesInit}
            options={{
                fullScreen: { enable: false }, // Важливо, щоб не перекривало кліки, якщо контейнер не на весь екран
                fpsLimit: 60,
                particles: {
                    // Налаштування картинки
                    shape: {
                        type: "image",
                        image: {
                            src: imagePath,
                            width: 100, // Пропорції
                            height: 100
                        }
                    },
                    // Кількість знаків (не роби забагато, щоб не лагало)
                    number: {
                        value: 30,
                        density: {
                            enable: true,
                            area: 800
                        }
                    },
                    // Розмір знаків
                    size: {
                        value: { min: 20, max: 40 }, // Різний розмір для глибини
                    },
                    // Рух (падають вниз як сніг/попіл)
                    move: {
                        enable: true,
                        speed: 3,
                        direction: "bottom",
                        random: false,
                        straight: false,
                        outModes: {
                            default: "out" // Коли долітають до низу - зникають
                        },
                    },
                    // Прозорість
                    opacity: {
                        value: 0.8,
                        random: true,
                    },
                    // Обертання (щоб падали реалістично)
                    rotate: {
                        value: 0,
                        random: true,
                        direction: "random",
                        animation: {
                            enable: true,
                            speed: 5,
                            sync: false
                        }
                    }
                }
            }}
        />
    );
};

export default BerserkConfetti;