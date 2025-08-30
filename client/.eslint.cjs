module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-refresh"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  env: { browser: true, es2021: true },
  ignorePatterns: ["dist", "node_modules"],
  rules: {
    "react-refresh/only-export-components": "warn",
  },
};
