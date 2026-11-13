import { mkdir, rm, copyFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const source of ['index.html', 'styles.css', 'app.js']) {
  await copyFile(resolve(root, source), resolve(dist, source));
}
await writeFile(resolve(dist, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log('ParishOS demo build complete (HTML/CSS/JS + robots.txt).');
