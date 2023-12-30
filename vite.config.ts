import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/rubicks-image",
  plugins: [react(), checker({typescript: true}) ],
})
