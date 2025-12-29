/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#fbf7f6',
                    100: '#f5eeeb',
                    200: '#eadcd7',
                    300: '#dbc1b8',
                    400: '#c59d90',
                    500: '#a77665', // Primary Brown
                    600: '#945f4f',
                    700: '#7c4b3d',
                    800: '#673e33',
                    900: '#55342d',
                },
                accent: {
                    500: '#d97706', // Amber/Gold
                    600: '#b45309',
                },
                surface: {
                    50: '#fafaf9', // Stone 50
                    100: '#f5f5f4', // Stone 100
                    200: '#e7e5e4', // Stone 200
                    900: '#1c1917', // Stone 900
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
