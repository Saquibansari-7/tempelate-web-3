const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const candidates = [
      path.join(process.cwd(), 'dist', 'data.json'),
      path.join(__dirname, '..', 'dist', 'data.json'),
      path.join(process.cwd(), 'data.json'),
    ];
    let raw = null;
    let used = null;
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        raw = fs.readFileSync(filePath, 'utf8');
        used = filePath;
        break;
      }
    }
    if (!raw) {
      console.error('data.json not found in expected paths:', candidates);
      return res.status(404).json({ error: 'data.json not found', candidates });
    }
    const data = JSON.parse(raw);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error('Failed to load data.json:', err);
    res.status(500).json({ error: 'Failed to load data.json', message: err.message });
  }
};
