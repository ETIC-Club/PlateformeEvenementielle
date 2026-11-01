import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const dbMessage =
  "L'accès DB se fait uniquement dans `queries.ts` (ou src/db, src/lib/auth). Appelez une query depuis un service.";
const nextMessage = "Un `service.ts` ne doit pas dépendre de Next.js : gardez-le testable seul.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    // Garde-fou d'architecture : la DB n'est importée que par les queries.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/queries.ts", "src/db/**", "src/lib/auth/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/db/client"], message: dbMessage }] },
      ],
    },
  },
  {
    files: ["src/features/**/service.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/db/client"], message: dbMessage },
            { group: ["next", "next/*"], message: nextMessage },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/db/migrations/**"]),
]);

export default eslintConfig;
