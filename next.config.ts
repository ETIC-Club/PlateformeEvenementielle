import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `cacheComponents` (cache partiel) est volontairement désactivé : rendu dynamique classique,
  // plus simple pour toute l'équipe (cookies()/headers() utilisables sans <Suspense>).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
