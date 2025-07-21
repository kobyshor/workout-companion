import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Reverting to the standard, simple configuration.
export default defineConfig({
  plugins: [react()],
})
