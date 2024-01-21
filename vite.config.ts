import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
import {visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/rubiks-image/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if(id.includes('three') || id.includes('@react-three')) {
            return 'three';
          }
        }
      }
    }
  },
  plugins: [
      react(),
      checker({typescript: true}),
      splitVendorChunkPlugin(),
      //visualizer({ filename: 'bundle-analysis.html', open: true }) as PluginOption,
  ]
})
