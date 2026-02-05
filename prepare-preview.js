import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirname, '.output', 'public');
const targetDir = path.join(__dirname, '.preview_dist');
const baseDir = path.join(targetDir, 'dinner-picker');

// Cleanup previous preview dist
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// Create directories
fs.mkdirSync(baseDir, { recursive: true });

// Copy files
console.log(`Copying files from ${sourceDir} to ${baseDir}...`);
fs.cpSync(sourceDir, baseDir, { recursive: true });

console.log('Preparation complete!');
console.log('To preview, run: npx serve .preview_dist');
