const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { initPool, query, getDatabaseStatus } = require('./server_config/db');
const { PORT, HOST } = require('./server_config/config');

const app = express();
const IMAGES_DIR = path.resolve(__dirname, 'images');
const FRONT_DIST = path.resolve(__dirname, '../front/dist');
const ADMIN_DIST = path.resolve(__dirname, '../adminPanel/dist');

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, IMAGES_DIR),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  },
});

multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.disable('x-powered-by');
app.use(cors({ origin: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use('/images', express.static(IMAGES_DIR));

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', database: getDatabaseStatus() });
});

app.get('/download/:filename', (req, res) => {
  const requested = req.params.filename;
  const filePath = path.resolve(IMAGES_DIR, requested || '');

  if (!requested || !filePath.startsWith(`${IMAGES_DIR}${path.sep}`)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  return fs.access(filePath, fs.constants.R_OK, error => {
    if (error) return res.status(404).json({ error: 'File not found' });
    return res.download(filePath);
  });
});

app.use('/api', require('./routes')(query));

if (fs.existsSync(ADMIN_DIST)) {
  app.use('/admin', express.static(ADMIN_DIST));
}

if (fs.existsSync(FRONT_DIST)) {
  app.use(express.static(FRONT_DIST));
}

app.use((req, res, next) => {
  if (req.method !== 'GET' || !req.accepts('html')) return next();

  if (req.path === '/admin') return res.redirect(301, '/admin/');
  if (req.path.startsWith('/admin/')) {
    const adminIndex = path.join(ADMIN_DIST, 'index.html');
    if (fs.existsSync(adminIndex)) return res.sendFile(adminIndex);
  }

  const frontIndex = path.join(FRONT_DIST, 'index.html');
  if (fs.existsSync(frontIndex)) return res.sendFile(frontIndex);

  return res.status(503).json({
    status: 'build_required',
    message: 'Frontend build was not found. Run the Render build command before starting the service.',
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || error.statusCode || 500;
  return res.status(status).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

async function startServer() {
  await initPool();
  app.listen(PORT, HOST, () => {
    console.log(`Application listening on http://${HOST}:${PORT}`);
    console.log(`Database status: ${getDatabaseStatus()}`);
  });
}

startServer().catch(error => {
  console.error('Startup error:', error);
  process.exitCode = 1;
});
