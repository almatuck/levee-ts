import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  shims: true,
  onSuccess: async () => {
    // Copy proto file to dist for runtime loading
    mkdirSync('dist/proto', { recursive: true })
    copyFileSync('proto/llm.proto', 'dist/proto/llm.proto')
  },
})
