import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const srcData = path.join(projectRoot, 'data.json');
const destData = path.join(projectRoot, 'dist', 'data.json');

if (fs.existsSync(srcData)) {
  fs.copyFileSync(srcData, destData);
  console.log('Copied data.json to dist/');
} else {
  console.warn('data.json not found at project root');
}

// Copy uploads folder (if present) into dist/uploads so static assets like audio are deployed
const srcUploads = path.join(projectRoot, 'uploads');
const destUploads = path.join(projectRoot, 'dist', 'uploads');
try {
  if (fs.existsSync(srcUploads)) {
    // fs.cpSync is available in Node 16.7+. Use recursive copy to include files.
    if (typeof fs.cpSync === 'function') {
      fs.cpSync(srcUploads, destUploads, { recursive: true });
    } else {
      // Fallback: create dest and copy files one by one
      fs.mkdirSync(destUploads, { recursive: true });
      const items = fs.readdirSync(srcUploads);
      for (const item of items) {
        const s = path.join(srcUploads, item);
        const d = path.join(destUploads, item);
        fs.copyFileSync(s, d);
      }
    }
    console.log('Copied uploads/ to dist/uploads/');
  } else {
    console.log('No uploads/ folder to copy');
  }
} catch (err) {
  console.warn('Failed to copy uploads folder:', err);
}
