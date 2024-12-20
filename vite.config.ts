import { defineConfig } from "vite";
import { unstable_vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true
      }
    }),
    tsconfigPaths()
  ],
  server: {
    port: 3000,
    host: "localhost"
  }
});
