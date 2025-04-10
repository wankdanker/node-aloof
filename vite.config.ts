import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'aloof',
      fileName: (format) => `aloof.${format}.js`,
      formats: ['es', 'cjs']
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      outDir: 'dist/types'
    })
  ]
});