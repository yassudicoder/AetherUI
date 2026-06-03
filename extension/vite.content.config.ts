import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Content scripts in MV3 are loaded as CLASSIC scripts, not ES modules, so they
// cannot contain `import` statements. We build the content script as a single
// self-contained IIFE bundle (all dependencies inlined, no shared chunks) into the
// same dist/assets/content.js the manifest points at. Runs after the main build with
// emptyOutDir: false so it doesn't wipe popup/background output.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/content/content.ts'),
      output: {
        format: 'iife',
        entryFileNames: 'assets/content.js',
        inlineDynamicImports: true,
      },
    },
  },
})
