import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default tseslint.config(
  {
    // Hors perimetre applicatif : reservoir de kit, specs, artefacts de build.
    ignores: ["dist", "src-tauri", "coverage", "node_modules", "global", "specs", "*.config.js"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    files: ["*.config.{js,ts}"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // Scripts Node ESM (gardes, generateurs) — globales Node BUILTIN seulement
    // (pas globals.node qui declare aussi require/module/__dirname : jurisprudence D-8).
    files: ["scripts/**"],
    languageOptions: {
      sourceType: "module",
      globals: globals.nodeBuiltin,
    },
  },
);
