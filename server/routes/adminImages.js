const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const { endpoint } = require('../utils/endpoint');
const { IMAGE_BASE } = require('../server_config/config');
module.exports = (query) => {
  const r = Router();
  const IMAGES_DIR = path.join(__dirname, '..', 'images');

  r.get(
    '/',
    endpoint(async (req) => {
      if (!fs.existsSync(IMAGES_DIR)) {
        return [];
      }

      const allowedExt = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
      const files = fs
        .readdirSync(IMAGES_DIR)
        .filter((f) => allowedExt.has(path.extname(f).toLowerCase()));
      let base = IMAGE_BASE || '';
      const host = String(req.get('host') || '');
      const reqOrigin = `${req.protocol}://${host}`;
      if (/localhost|127\.0\.0\.1/i.test(base) && !/localhost|127\.0\.0\.1/i.test(host)) {
        base = `${reqOrigin}/images/`;
      }
      return files.map((filename) => ({
        id: filename,
        filename,
        url: `/images/${filename}`,
      }));
    })
  );

  return r;
};

