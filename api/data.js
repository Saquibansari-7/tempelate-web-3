import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (req, res) => {
  try {
    const distPath = path.join(__dirname, '..', 'dist', 'data.json');
    const rootPath = path.join(__dirname, '..', 'data.json');
    const filePath = fs.existsSync(distPath) ? distPath : rootPath;
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    res.setHeader('Content-Type', 'application/json');
    res.json(data);
  } catch (err) {
    console.error('Failed to load data.json:', err);
    res.status(500).json({ error: 'Failed to load data.json' });
  }
};
