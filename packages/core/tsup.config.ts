import { defineConfig } from 'tsup';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  globalName: 'PromptJS',
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  treeshake: true,
  outDir: 'dist',
  define: {
    __PROMPTJS_VERSION__: JSON.stringify(pkg.version)
  },
  onSuccess: 'postcss styles/promptjs.css -o styles/promptjsx.css'
});
