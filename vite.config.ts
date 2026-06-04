import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// import fs from 'fs'
// import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // resolve: {
  //   alias: {
  //     './src/manifest.json': path.resolve(__dirname, './manifest.json')
  //   }
  // },
  plugins: [uni()],
  server: {
    port: 5173
  }
})
