import React, { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const BerserkConfetti = () => {
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    const imagePath = `${import.meta.env.BASE_URL}images/berserk_mark.png`;

    return (
        <Particles
            id="tsparticles"
            className="fixed inset-0 z-[100] pointer-events-none h-full w-full"
            init={particlesInit}
            options={{
                fullScreen: { enable: true, zIndex: 100 },
                fpsLimit: 120,
                particles: {
                    // 1. Картинка
                    shape: {
                        type: "image",
                        image: {
                            src: imagePath,
                            width: 100,
                            height: 100
                        }
                    },
                    // 2. Кількість (ЗМЕНШЕНО: тепер їх всього 15 на екрані)
                    number: {
                        value: 20,
                        density: {
                            enable: true,
                            area: 800
                        }
                    },
                    // 3. Розмір (ЗМЕНШЕНО: тепер вони дрібніші)
                    size: {
                        value: { min: 9, max: 22 },
                    },
                    // 4. Рух (Трохи повільніше і плавніше)
                    move: {
                        enable: true,
                        speed: 2,
                        direction: "bottom",
                        random: false,
                        straight: false,
                        outModes: {
                            default: "out",
                        },
                    },
                    // 5. Прозорість (Зробив прозорішими, щоб не заважали)
                    opacity: {
                        value: 0.85,
                        random: true, // Тепер деякі будуть зовсім бліді
                        anim: {
                            enable: false
                        }
                    },
                    // 6. Обертання
                    rotate: {
                        value: { min: 0, max: 360 },
                        animation: {
                            enable: true,
                            speed: 3, // Повільніше обертання
                            sync: false
                        }
                    }
                }
            }}
        />
    );
};

export default BerserkConfetti;