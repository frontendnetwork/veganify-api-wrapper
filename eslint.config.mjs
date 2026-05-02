import tseslint from "typescript-eslint";

export default tseslint.config(...tseslint.configs.strict, {
  languageOptions: {
    parserOptions: {
      project: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    // Allow ts-expect-error in test files and controlled scenarios
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
  },
});
