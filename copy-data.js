import fs from 'fs';
import path from 'path';

const src = path.join(process.cwd(), 'data.json');
const dest = path.join(process.cwd(), 'dist', 'data.json');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Copied data.json to dist/');
} else {
  console.warn('data.json not found at project root');
}
