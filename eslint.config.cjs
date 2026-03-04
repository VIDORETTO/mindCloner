const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/**", ".mindclone/**", ".tmp-check/**", "exports/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
      "no-empty": "off",
      "no-unused-vars": "off",
      "preserve-caught-error": "off",
    },
  },
];
