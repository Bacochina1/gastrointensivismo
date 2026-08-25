import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([

  {
    rules: {
      // Estes efeitos hidratam estado persistido no localStorage e na URL.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  globalIgnores([
    ".next/**",
    ".open-next/**",
    "src/generated/**",
    "next-env.d.ts",
  ]),
]);
