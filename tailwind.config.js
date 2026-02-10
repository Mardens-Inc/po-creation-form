import {heroui} from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
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
                        "50": "#eda6ab",
                        "100": "#ed8e95",
                        "200": "#ed5f68",
                        "300": "#ed4752",
                        "400": "#ec2b37",
                        "500": "#d42530",
                        "600": "#b01e28",
                        "700": "#8c1820",
                        "800": "#6b1218",
                        "900": "#4d0d11"
                    },
                    secondary: {
                        DEFAULT: "#fec60b",
                        foreground: "#000"
                    },
                    background: "#fff",
                    navigation: {
                        DEFAULT: "#0f0f12",
                        foreground: "#ffffff"
                    }

                }
            },
        }
    })]
}