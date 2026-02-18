/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5',
                    light: '#818cf8',
                },
                accent: {
                    DEFAULT: '#06b6d4',
                    dark: '#0891b2',
                },
                surface: {
                    DEFAULT: '#1e1b4b',
                    light: '#312e81',
                    card: 'rgba(30, 27, 75, 0.6)',
                },
                danger: '#ef4444',
                success: '#22c55e',
                warning: '#f59e0b',
                'text-primary': '#f8fafc',
                'text-secondary': '#94a3b8',
                'text-muted': '#64748b',
                border: 'rgba(99, 102, 241, 0.2)',
                glass: 'rgba(255, 255, 255, 0.05)',
                'glass-hover': 'rgba(255, 255, 255, 0.1)',
            },
        },
    },
    plugins: [],
}
