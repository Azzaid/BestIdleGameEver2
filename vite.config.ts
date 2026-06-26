import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), vanillaExtractPlugin()],
  server: {
    watch: {
      ignored: [
        '**/src/assets/buildings/**',
        '**/src/assets/events/**',
        '**/src/assets/gunParts/**',
        '**/src/assets/hexBackgrounds/**',
        '**/src/assets/wallSegments/**',
        '**/src/assets/wallSuperstructures/**',
      ],
    },
  },
})
