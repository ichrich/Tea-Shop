const express = require('express');
const { initPool, query } = require('./server_config/db');
const { PORT } = require('./server_config/config');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const multer = require('multer');
const path = require('path');
const IMAGES_DIR = path.resolve(__dirname, 'images');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, IMAGES_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB лимит
});

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use('/images', express.static(path.join(__dirname, 'images')));
const CERTS_BASE_DIR = path.join(__dirname, 'images');
app.get('/download/:filename', (req, res) => {
  const requested = req.params.filename;
  if (!requested) {
    return res.status(400).json({ error: 'Missing filename' });
  }
  const filePath = path.resolve(CERTS_BASE_DIR, requested);
  if (!filePath.startsWith(CERTS_BASE_DIR)) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.download(filePath, (err) => {
      if (err) {
        console.error('Download error', err);
        res.status(500).json({ error: 'Could not download file' });
      }
    });
  });
});
async function startServer() {
  try {
    await initPool();
    console.log('Database connected successfully');
    try {
      require('bcrypt');
      require('jsonwebtoken');
      require('cookie-parser');
      console.log('All required modules loaded successfully');
    } catch (moduleErr) {
      console.error('Missing required module:', moduleErr.message);
      console.error('Please run: npm install bcrypt jsonwebtoken cookie-parser');
      process.exit(1);
    }
    try {
      const routes = require('./routes');
      app.use('/api', routes(query));
      console.log('Routes registered successfully');
    } catch (routeErr) {
      console.error('Error loading routes:', routeErr);
      throw routeErr;
    }
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      
      res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    });
    
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Auth endpoint: http://localhost:${PORT}/api/auth/login`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

startServer();