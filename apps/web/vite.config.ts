import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// The Worker (worker/) is bundled by Wrangler, not Vite: React Router's build-time
// prerendering cannot run alongside @cloudflare/vite-plugin. In development Vite serves the
// app and forwards API calls to `wrangler dev`.
export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
});
