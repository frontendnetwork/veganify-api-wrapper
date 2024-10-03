import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    // Compile TypeScript
    execSync('tsc', { stdio: 'inherit' });

    // Copy non-TS files to dist folder
    const sourceDir = 'lib';
    const targetDir = 'dist';

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    fs.readdirSync(sourceDir).forEach(file => {
        if (!file.endsWith('.ts')) {
            fs.copyFileSync(`${sourceDir}/${file}`, `${targetDir}/${file}`);
        }
    });

    console.log('Build complete.');
} catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
}