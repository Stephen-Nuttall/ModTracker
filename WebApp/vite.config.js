import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "ModTracker",
    define: {
        'import.meta.env.BACKEND_IP': JSON.stringify(process.env.BACKEND_IP),
        'import.meta.env.CURSEFORGE_API_KEY': JSON.stringify(process.env.CURSEFORGE_API_KEY),
    },
})
