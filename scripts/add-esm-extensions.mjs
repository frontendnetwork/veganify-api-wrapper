#!/usr/bin/env node
// Adds .js extensions to relative imports in ESM output files so they can
// be loaded directly by Node.js ESM (which requires explicit extensions).
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function fixExtensions(dir) {
  for (const entry of readdirSync(dir)) {
    const fp = join(dir, entry);
    if (statSync(fp).isDirectory()) {
      fixExtensions(fp);
      continue;
    }
    if (!entry.endsWith(".js")) continue;
    let src = readFileSync(fp, "utf8");
    // Add .js to bare relative imports/exports that don't already have an extension
    src = src.replace(
      /\b(from\s+|export\s+\*\s+from\s+)(["'])(\.\.?\/[^"']+?)(["'])/g,
      (match, keyword, q1, p, q2) => {
        if (/\.[cm]?js$/.test(p)) return match;
        return `${keyword}${q1}${p}.js${q2}`;
      }
    );
    writeFileSync(fp, src);
  }
}

fixExtensions("./dist/esm");
console.log("ESM extensions fixed.");
