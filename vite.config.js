import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server / bundler config
export default defineConfig({
  plugins: [react()],
})
