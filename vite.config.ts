import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Force a single React instance (prevents "Invalid hook call")
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Ensure deps are re-optimized after dependency changes
    force: true,
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-toast",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
    ],
  },
}));
