import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    allowedHosts: [
      '49e9-2804-29b8-5226-41be-8491-eb77-3dcb-b6c.ngrok-free.app'
    ]
  }
})
