const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'wedding-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Static files
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// Data file
const DATA_FILE = 'data.json';

// Default data
const defaultData = {
  weddingDate: "2027-08-22T10:00:00",
  texts: {
    welcome: "We are so excited to celebrate our love with the people who mean the most to us. Join us for a day filled with laughter, love, and happily ever afters.",
    story: "It started with a chance encounter at a coffee shop, where Isabel ordered a tea and Kevin spilled his coffee. Nervous laughter turned into a conversation that lasted for hours, and we haven't stopped talking since.\n\nThrough travels, late-night study sessions, and building a home together, our bond only grew stronger. We realized that we weren't just partners; we were best friends ready to take on the world together.\n\nThree years later, under a canopy of autumn leaves, Kevin got down on one knee. With tears of joy and a resounding \"Yes!\", we began this beautiful journey toward our wedding day.",
    hashtag: "#IsabelAndKevin"
  },
  images: {
    couple: "https://picsum.photos/seed/isabelkevin/400/400",
    story: "https://picsum.photos/seed/lovestory/400/600",
    final: "https://picsum.photos/seed/couplefinal/200/200"
  },
  ceremony: {
    location: "The Grand Chapel",
    address: "123 Love Avenue, City of Romance",
    time: "10:00 AM"
  },
  reception: {
    location: "The Rose Garden Estate",
    address: "456 Sunset Blvd, City of Romance",
    time: "1:00 PM onwards"
  },
  entourage: {
    parents: "Robert & Maria Santos / David & Elizabeth Miller",
    sponsors: "Mr. John Doe, Ms. Jane Smith, Dr. Alan Grant",
    maidOfHonor: "Sarah",
    bestMan: "Michael"
  },
  timeline: [
    { event: "Ceremony", description: "Exchange of vows and rings", time: "10:00 AM", icon: "fas fa-church" },
    { event: "Cocktails", description: "Drinks and canapes by the garden", time: "12:00 PM", icon: "fas fa-cocktail" },
    { event: "Lunch & Program", description: "Feast, speeches, and dancing", time: "1:00 PM", icon: "fas fa-utensils" },
    { event: "Cake Cutting", description: "Sweet beginnings", time: "3:30 PM", icon: "fas fa-birthday-cake" },
    { event: "Farewell", description: "Grand exit send-off", time: "5:00 PM", icon: "fas fa-door-open" }
  ]
};

// Load data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
  return defaultData;
}

// Save data
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving data:', err);
  }
}

// Ensure data exists
if (!fs.existsSync(DATA_FILE)) {
  saveData(defaultData);
}

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware to check admin authentication
const checkAuth = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.status(401).redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => {
  if (req.query.admin === 'true') {
    if (req.session.loggedIn) {
      res.sendFile(path.join(__dirname, 'admin.html'));
    } else {
      res.sendFile(path.join(__dirname, 'login.html'));
    }
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/data', (req, res) => {
  res.json(loadData());
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', username, password);
  if (username === 'admin' && password === 'password') {
    req.session.loggedIn = true;
    console.log('Login successful, redirecting to /admin');
    res.redirect('/admin');
  } else {
    console.log('Invalid credentials');
    res.status(401).send('<h2>Invalid credentials</h2><p><a href="/login">Try again</a></p>');
  }
});

app.get('/admin', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/');
  });
});

// Deep merge helper
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, source) {
  if (!isObject(target) || !isObject(source)) return source;
  const output = { ...target };
  Object.keys(source).forEach(key => {
    if (isObject(source[key])) {
      if (!(key in target)) Object.assign(output, { [key]: source[key] });
      else output[key] = mergeDeep(target[key], source[key]);
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  });
  return output;
}

app.post('/update', checkAuth, (req, res) => {
  try {
    console.log('Update payload:', JSON.stringify(req.body, null, 2));
    const data = loadData();
    const merged = mergeDeep(data, req.body);
    saveData(merged);
    res.json({ success: true, message: 'Updated successfully', data: merged });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
});

app.post('/upload/:type', checkAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const data = loadData();
  const filePath = '/uploads/' + req.file.filename;
  data.images[req.params.type] = filePath;
  saveData(data);
  res.json({ success: true, path: filePath, message: 'Image uploaded successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});