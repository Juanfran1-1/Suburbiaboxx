import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    base: env.VITE_PANEL_BASE_PATH || '/',
    plugins: [react()],
  }
})
