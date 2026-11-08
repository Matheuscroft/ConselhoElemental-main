import { version } from "./package.json"
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { assertAccountBuildConfig } from "./src/lib/backup/account-build-config"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  assertAccountBuildConfig(env, process.env.VERCEL === "1");
  return {
  base: '/',
  plugins: [react(), {
    name: 'conselho-release',
    generateBundle() { this.emitFile({ type: 'asset', fileName: 'app-version.json', source: JSON.stringify({ format: 'conselho-release', version }) }); },
  }],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
