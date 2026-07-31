const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('dist'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
  secret: 'wedding-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password';

function requireAuth(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  return res.redirect('/login');
}

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    return res.redirect('/admin');
  }
  
  res.send('<h2>Invalid credentials</h2><p><a href="/login">Try again</a></p>');
});

app.get('/data', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(__dirname, 'data.json'));
});

app.get('/api/auth-status', (req, res) => {
  if (req.session && req.session.loggedIn) {
    return res.json({ authenticated: true });
  }
  res.status(401).json({ authenticated: false });
});

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/');
  });
});

app.post('/api/update-data', (req, res) => {
  try {
    const websiteContent = req.body.content || req.body;
    const existingData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));

    const flat = {
      ...existingData,
      weddingDate: websiteContent?.countdown?.targetDate || websiteContent?.hero?.date || existingData.weddingDate,
      texts: {
        ...existingData.texts,
        welcome: websiteContent?.quote?.text || existingData.texts?.welcome || '',
        story: [websiteContent?.story?.paragraph1, websiteContent?.story?.paragraph2].filter(Boolean).join('\n\n') || existingData.texts?.story || '',
        hashtag: websiteContent?.couple?.hashtag || existingData.texts?.hashtag || ''
      },
      images: {
        ...existingData.images,
        couple: websiteContent?.hero?.image || existingData.images?.couple || '',
        story: websiteContent?.story?.image || existingData.images?.story || '',
        final: websiteContent?.invitationCard?.image || existingData.images?.final || '',
        menu: websiteContent?.events?.menuImage || existingData.images?.menu || ''
      },
      locationCoords: websiteContent?.events?.ceremony?.mapCoords || existingData.locationCoords || null,
      ceremony: {
        ...existingData.ceremony,
        location: websiteContent?.events?.ceremony?.venue || existingData.ceremony?.location || '',
        address: websiteContent?.events?.ceremony?.location || existingData.ceremony?.address || '',
        time: websiteContent?.events?.ceremony?.time || existingData.ceremony?.time || ''
      },
      reception: {
        ...existingData.reception,
        location: websiteContent?.events?.reception?.venue || existingData.reception?.location || '',
        address: websiteContent?.events?.reception?.location || existingData.reception?.address || '',
        time: websiteContent?.events?.reception?.time || existingData.reception?.time || ''
      },
      timeline: Array.isArray(websiteContent?.timeline) ? websiteContent.timeline : (existingData.timeline || []),
      frontNames: `${websiteContent?.couple?.name1 || ''} & ${websiteContent?.couple?.name2 || ''}`,
      endNames: `${websiteContent?.couple?.name1 || ''} & ${websiteContent?.couple?.name2 || ''}`,
      entourage: {
        parents: websiteContent?.entourage?.parents || existingData.entourage?.parents || '',
        sponsors: websiteContent?.entourage?.sponsors || existingData.entourage?.sponsors || '',
        maidOfHonor: websiteContent?.entourage?.maidOfHonor || existingData.entourage?.maidOfHonor || '',
        bestMan: websiteContent?.entourage?.bestMan || existingData.entourage?.bestMan || ''
      },
      footer: {
        ...existingData.footer,
        text: websiteContent?.footer?.text || existingData.footer?.text || '',
        image: websiteContent?.footer?.image || existingData.footer?.image || ''
      }
    };

    fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(flat, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to write data.json' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/login`);
  console.log(`Credentials: ${ADMIN_USERNAME} / ${ADMIN_PASSWORD}`);
});
