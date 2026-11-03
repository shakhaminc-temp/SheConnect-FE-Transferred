import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/sheconnect/',
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    host: true, // Listen on all network addresses (LAN access for mobile testing)
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-map': ['maplibre-gl'],
          'vendor-icons': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1100
  }
})
