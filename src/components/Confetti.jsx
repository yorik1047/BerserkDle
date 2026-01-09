import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const Confetti = () => {
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fullScreen: { 
                    enable: true, 
                    zIndex: 50 
                },
                fpsLimit: 120,
                particles: {
                    number: {
                        value: 0
                    },
                    color: {
                        value: ["#8B0000", "#000000", "#540000"]
                    },
                    shape: {
                        type: "image",
                        image: {
                            src: "/images/brand.svg",
                            width: 100,
                            height: 100
                        }
                    },
                    opacity: {
                        value: { min: 0.3, max: 1 },
                        animation: {
                            enable: true,
                            speed: 0.5,
                            sync: false
                        }
                    },
                    size: {
                        value: { min: 10, max: 30 }
                    },
                    move: {
                        enable: true,
                        speed: { min: 5, max: 15 },
                        direction: "none",
                        random: false,
                        straight: false,
                        outModes: {
                            default: "destroy"
                        },
                        gravity: {
                            enable: true,
                            acceleration: 0.5
                        }
                    }
                },
                emitters: {
                    direction: "top",
                    rate: {
                        delay: 0.1,
                        quantity: 5
                    },
                    position: {
                        x: 50,
                        y: 100
                    },
                    size: {
                        width: 0,
                        height: 0
                    },
                    life: {
                        count: 0, // Continuous
                        duration: 0.1,
                        delay: 0.1
                    }
                }
            }}
        />
    );
};

export default Confetti;
