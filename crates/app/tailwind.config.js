import {heroui} from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        fontFamily: {
            roboto: ['Roboto', 'sans-serif'],
            text: ['dunbar-text', 'sans-serif'],
            headers: ['dunbar-tall', 'sans-serif'],
            accent: ['eds-market-narrow-slant', 'cursive'],
        },
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1350px',
            '2xl': '1536px',
        },
        extend: {
            typography: {
                DEFAULT: {
                    css: {
                        h1: {
                            fontFamily: 'dunbar-tall, sans-serif',
                            fontWeight: '900',
                        },
                        h2: {
                            fontFamily: 'dunbar-tall, sans-serif',
                            fontWeight: '900',
                        },
                        h3: {
                            fontFamily: 'dunbar-tall, sans-serif',
                            fontWeight: '900',
                        },
                        h4: {
                            fontFamily: 'dunbar-tall, sans-serif',
                            fontWeight: '900',
                        },
                        p: {
                            fontFamily: 'dunbar-text, sans-serif',
                        },
                    },
                },
            },
        },
    },
    darkMode: "class",
    plugins: [heroui({
        themes: {
            light: {
                colors: {
                    primary: {
                        DEFAULT: "#ec2b37",
                        foreground: "#fff",
                    },
                    secondary: "#fec60b",
                    background: "#fff",

                }
            },
        }
    })]
}