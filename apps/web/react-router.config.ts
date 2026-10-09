import type { Config } from "@react-router/dev/config";

// SPA + prerender (decision 2): no runtime server rendering. Public guide pages are
// rendered to HTML at build time; everything else is served as the SPA fallback.
export default {
  ssr: false,
  prerender: ["/"],
} satisfies Config;
