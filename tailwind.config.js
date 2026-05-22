/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./error.vue",
    ],
    theme: {
        extend: {
            colors: {
                mappa: {
                    bgDeep: '#05020A',
                    card: 'rgba(124, 58, 237, 0.08)',
                    primary: '#9333EA',
                    primaryTo: '#C084FC',
                    cursedCyan: '#22D3EE',
                    bloodRed: '#EF4444',
                    textBase: '#FFFFFF',
                    textMuted: '#A19BB5',
                    danger: '#E53E3E',
                    income: '#3B82F6'
                }
            }
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
}
