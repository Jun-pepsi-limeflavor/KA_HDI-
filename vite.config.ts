import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/KA_HDI-/', // GitHub 리포지토리 이름에 맞춤
  server: {
    port: 3000,
    open: true
  }
})