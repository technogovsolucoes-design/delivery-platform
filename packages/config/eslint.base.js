// @ts-check
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: ["**/dist/**", "**/.next/**", "**/.expo/**", "**/node_modules/**", "**/lib/**"],
  },
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // The eslint.config.js files themselves are plain CommonJS (module.exports/require),
    // loaded directly by ESLint's flat-config runner — not compiled, so they can't use import.
    files: ["eslint.config.js", "eslint.base.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
