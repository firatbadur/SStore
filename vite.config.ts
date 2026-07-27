import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: GitHub Pages proje sayfası (firatbadur.github.io/SStore/) altında yayınlanır.
export default defineConfig({
  base: '/SStore/',
  plugins: [react()],
})
