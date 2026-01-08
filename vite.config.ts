import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/HDI_DASH/', // 리포지토리 이름으로 변경하세요
  server: {
    port: 3000,
    open: true
  }
})