import React, { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
// Імпортуємо картинку прямо тут.
// ВАЖЛИВО: Переконайтеся, що шлях правильний відносно цієї папки.
// Якщо brand.svg лежить в src, то шлях '../brand.svg' (вихід з папки components)
import brandImg from "../brand.svg";

const GrimParticles = React.memo(() => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    const options = useMemo(() => ({
        fullScreen: { enable: false },
        background: { color: "transparent" },
        style: {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            pointerEvents: "none",
        },
        particles: {
            number: { value: 60, density: { enable: true, area: 800 } },
            color: { value: "#8B0000" },
            shape: {
                type: "image",
                image: { src: brandImg, width: 100, height: 100 },
            },
            opacity: { value: 1 },
            size: { value: { min: 10, max: 20 } }, // Маленький розмір
            move: {
                enable: true,
                speed: 2, // Повільна швидкість
                direction: "bottom",
                random: false,
                straight: false,
                outModes: "out",
            },
            rotate: {
                value: { min: 0, max: 360 },
                animation: { enable: true, speed: 5, sync: false },
            },
        },
    }), []);

    return <Particles id="tsparticles" init={particlesInit} options={options} />;
});

export default GrimParticles;