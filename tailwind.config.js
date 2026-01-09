/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'berserk-red': '#8a0303',
                'berserk-dark': '#1a1a1a',
            },
            fontFamily: {
                serif: ['"Crimson Text"', 'serif'], // Example serif
            }
        },
    },
    plugins: [],
}
