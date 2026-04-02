import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";
import basicSsl from '@vitejs/plugin-basic-ssl';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true, // Allows access via 192.168.x.x
    port: 5173, // Or whatever your frontend port is
    https: true,
    proxy: {
      // 1. Proxy standard API calls
      '/api': {
        target: 'http://127.0.0.1:3001', // 👈 Put your exact BACKEND IP and Port here
        changeOrigin: true,
        secure: false, // Don't verify SSL on the backend
      },
      // 2. Proxy WebSocket connections
      '/socket.io': {
        target: 'http://127.0.0.1:3001', // 👈 Put your exact BACKEND IP and Port here
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
