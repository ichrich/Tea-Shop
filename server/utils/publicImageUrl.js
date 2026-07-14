'use strict';

const path = require('path');
function sanitizeImageFilename(name) {
  if (name == null || name === '') return null;
  const base = path.basename(String(name));
  if (!base || base === '.' || base === '..') return null;
  if (base.includes('..')) return null;
  return base;
}

function relativeImagesUrl(filename) {
  const safe = sanitizeImageFilename(filename);
  if (!safe) return null;
  return `/images/${encodeURIComponent(safe)}`;
}

function absoluteImagesUrlFromReq(req, filename) {
  const rel = relativeImagesUrl(filename);
  if (!rel) return null;
  const host = typeof req.get === 'function' ? String(req.get('host') || '') : '';
  if (!host) return rel;
  const proto =
    req.protocol === 'http' || req.protocol === 'https' ? req.protocol : 'https';
  return `${proto}://${host}${rel}`;
}

module.exports = {
  sanitizeImageFilename,
  relativeImagesUrl,
  absoluteImagesUrlFromReq,
};
