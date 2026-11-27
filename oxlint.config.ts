import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import antiSlop from "ultracite/oxlint/anti-slop";

export default defineConfig({
  env: core.env,
  extends: [core, antiSlop],
  ignorePatterns: [...core.ignorePatterns, "scripts/**"],
  options: { typeAware: true },
  rules: {
    // TSDoc tags the codebase already documents with (verified: silences every
    // jsdoc finding on lib/ without pulling in eslint-plugin-tsdoc)
    "jsdoc/check-tag-names": [
      "error",
      { definedTags: ["remarks", "typeParam"] },
    ],
  },
  overrides: [
    {
      // The error hierarchy (base + 2 subclasses) is intentionally one file;
      // per-class modules would fragment the documented error surface.
      files: ["lib/errors.ts"],
      rules: { "max-classes-per-file": ["error", 3] },
    },
    {
      // Sequential mockResolvedValueOnce chains are the point of these tests.
      // bun:test matcher methods are typed `void` (jest types them Promise<void>),
      // so `await expect(...).rejects.toThrow()` trips await-thenable and
      // no-confusing-void-expression as false positives. Stub bodies prefer the
      // non-async `() => Promise.resolve(x)` shape, which promise-function-async
      // would flag in turn — the two rules cannot both pass on these stubs.
      files: ["tests/**"],
      rules: {
        "no-await-in-loop": "off",
        "typescript/await-thenable": "off",
        "typescript/no-confusing-void-expression": "off",
        "typescript/promise-function-async": "off",
      },
    },
  ],
});
