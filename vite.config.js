import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // A local .env may say NODE_ENV=development (for the server): a build must still ship production React.
  if (command === 'build') process.env.VITE_USER_NODE_ENV = 'production' // read by Vite in place of the .env line
  return {
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Libraries change rarely: in files of their own, returning visitors keep them cached
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) return 'react'
          if (/[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'motion'
          return undefined
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
}
})
