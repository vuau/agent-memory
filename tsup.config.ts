import { defineConfig } from "tsup"

export default defineConfig([
  // CLI entry — inject shebang so the binary is directly executable
  {
    entry: { "bin/cli": "bin/cli.ts" },
    format: ["esm"],
    outDir: "dist",
    clean: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
  // Library entry — OpenCode plugin + public API
  {
    entry: { index: "index.ts" },
    format: ["esm"],
    outDir: "dist",
    clean: true,
    dts: false,
  },
])
