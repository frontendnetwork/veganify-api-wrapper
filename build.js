const { execSync } = require('child_process');

// Compile TypeScript
execSync('tsc');

// Copy non-TS files to dist folder
execSync('cp -R lib/* dist/');

console.log('Build complete.');