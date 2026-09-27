import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),          // Required: Midnight SDK uses WebAssembly for ZK proving in browser
    topLevelAwait(), // Required: SDK uses top-level await in WASM modules
  ],
  // Allow serving managed/ assets with correct MIME types
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  build: {
    target: 'esnext', // Required for top-level await
  },

});
