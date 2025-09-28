// import { defineConfig } from 'tsup';
// import fs from 'node:fs';

// const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// export default defineConfig({
//   entry: ['src/index.tsx'],
//   format: ['esm', 'cjs'],
//   dts: true,
//   sourcemap: true,
//   clean: true,
//   minify: true,
//   treeshake: true,
//   outDir: 'dist',
//   define: {
//     __PROMPTJS_VERSION__: JSON.stringify(pkg.version)
//   }
// });


import { defineConfig } from 'tsup';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  minify: false,
  external: ["react", "react-dom"], 
  target: "es2020",
  define: {
    __PROMPTJS_VERSION__: JSON.stringify(pkg.version)
  }
});



