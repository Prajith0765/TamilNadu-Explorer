import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // The port you're using for your server
    hmr: {
      protocol: 'ws', // WebSocket protocol
      host: 'localhost', // The hostname (this is usually 'localhost')
      port: 5174, // Ensure this matches the server port
    },
  },
});
