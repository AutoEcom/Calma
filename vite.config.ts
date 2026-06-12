import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@mux/upchunk'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('lucide-react')) return 'vendor-icons'
          if (id.includes('react-router') || id.includes('@remix-run')) return 'vendor-router'
          if (id.includes('framer-motion')) return 'vendor-motion'
          if (id.includes('@supabase')) return 'vendor-supabase'
          if (id.includes('@mux') || id.includes('hls.js')) return 'vendor-media'
          if (
            id.includes('react-dom') ||
            id.includes('/react/') ||
            id.includes('scheduler')
          ) {
            return 'vendor-react'
          }

          return 'vendor-misc'
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
})
