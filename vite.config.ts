import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1')
      },
      // Proxy para endpoints sin /api/v1
      '/mapa': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/usuarios': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/productos': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/tareas': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/supervisor/vista': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/mapa/reponedor/vista': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/reponedor/vista': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Solo hacer proxy de la API de reportes, no de la ruta del frontend
      '/api/reportes': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/muebles': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/puntos': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/predicciones': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api/v1${path}`
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
