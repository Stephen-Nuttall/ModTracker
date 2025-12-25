import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "ModTracker",
    define: {
        'import.meta.env.CURSEFORGE_API_KEY': JSON.stringify(process.env.CURSEFORGE_API_KEY),
        'import.meta.env.VITE_CURSEFORGE_API_KEY': JSON.stringify(process.env.VITE_CURSEFORGE_API_KEY),
    },
})
