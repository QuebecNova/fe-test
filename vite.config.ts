// import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(() => {
    return {
        plugins: [react()],
        server: {
            port: 3000,
            watch: {
                usePolling: true,
            },
        },
    }
})
