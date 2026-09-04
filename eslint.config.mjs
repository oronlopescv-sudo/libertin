import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import unicorn from "eslint-plugin-unicorn";
import prettier from "eslint-plugin-prettier";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    // Base Next.js config
    extends: [...next],
    plugins: {
      import: importPlugin,
      jsdoc: jsdoc,
      unicorn: unicorn,
      prettier: prettier,
    },
    rules: {
      // Enforce Prettier formatting as ESLint errors
      "prettier/prettier": "error",
      // Disallow usage of secret env vars in client code
      "no-restricted-modules": [
        "error",
        {
          name: "process.env",
          importNames: ["SUPABASE_SERVICE_ROLE_KEY", "STRIPE_SECRET_KEY", "RESEND_API_KEY"],
          message: "Secret env vars should not be imported in client code",
        },
      ],
      // Additional recommended rules (example)
      "import/order": ["error", { "alphabetize": { "order": "asc" } }],
      "jsdoc/check-alignment": "warn",
      "unicorn/prefer-node-protocol": "error",
    },
  },
]);
