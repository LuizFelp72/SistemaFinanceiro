import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': process.env.API_PROXY_TARGET || 'http://127.0.0.1:3000' } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/zrender')) {
            return 'zrender'
          }
          if (id.includes('node_modules/echarts') || id.includes('node_modules/echarts-for-react')) {
            return 'charts'
          }
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
            return 'mui'
          }
        },
      },
    },
  },
})
