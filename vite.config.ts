import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use repository subpath when building for GitHub Pages.
  base: command === 'build' ? '/calClories/' : '/',
}))
