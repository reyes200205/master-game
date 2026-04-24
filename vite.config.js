import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  // Fíjate aquí: debe ser "server" con S
  server: {
    // Esto permite el acceso desde cualquier host (IP, dominio, local)
    allowedHosts: true 
  }
})