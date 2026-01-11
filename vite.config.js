import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // ВАЖЛИВО: Назва репозиторію має бути в слішах '/'
  base: '/BerserkDle/',
  plugins: [react()],
})