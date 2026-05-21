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
                    bgDeep: '#030305',
                    card: '#0F0F14',
                    primary: '#581C87',
                    primaryTo: '#991B1B',
                    textBase: '#F1F5F9',
                    textMuted: '#71717A',
                    danger: '#E11D48',
                    income: '#06B6D4'
                }
            }
        },
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
}
