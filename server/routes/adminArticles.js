const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
const { imageUrl } = require('../utils/image');
const path = require('path');
const fs = require('fs');
module.exports = (query) => {
  const r = Router();
  const IMAGES_DIR = path.join(__dirname, '..', 'images');

  const ensureImagesDir = () => {
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
  };

  const saveDataUrlImage = ({ dataUrl, originalName }) => {
    if (!dataUrl || typeof dataUrl !== 'string') return null;
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;
    const mime = match[1];
    const base64 = match[2];
    const extFromMime = mime.split('/')[1] || 'png';
    const safeExt = extFromMime.replace(/[^a-zA-Z0-9]/g, '') || 'png';
    const stamp = Date.now();
    const rand = Math.random().toString(16).slice(2, 10);
    const filename = `blog-${stamp}-${rand}.${safeExt}`;
    const filePath = path.join(IMAGES_DIR, filename);
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filePath, buffer);
    return filename;
  };
  r.use(authenticateToken);
r.get(
    '/',
    endpoint(async () => {
      const rows = await query(
        `
        SELECT id, title, category, date_published, author, excerpt, image
        FROM articles
        WHERE blog_id = 1
        ORDER BY date_published IS NULL, date_published DESC, id DESC
        `
      );

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        date: row.date_published,
        author: row.author,
        excerpt: row.excerpt || '',
        published: !!row.date_published,
        image: row.image ? imageUrl(row.image) : null,
        images: row.image ? [{ id: `main_${row.id}`, url: imageUrl(row.image) }] : [],
      }));
    })
  );
r.post(
    '/update',
    endpoint(async (req) => {
      const { id, title, category, excerpt, author, image, imageUrl: incomingImageUrl } = req.body;

      if (!id) {
        throw new Error('Missing id');
      }

      ensureImagesDir();

      let imageFilename = null;
      let shouldUpdateImage = false;
      if (image && typeof image === 'object' && typeof image.dataUrl === 'string') {
        imageFilename = saveDataUrlImage({ dataUrl: image.dataUrl, originalName: image.name });
        shouldUpdateImage = true;
      } else if (typeof incomingImageUrl === 'string' && incomingImageUrl.trim()) {
        const base = path.basename(incomingImageUrl.trim());
        imageFilename = base || null;
        shouldUpdateImage = true;
      }

      if (shouldUpdateImage) {
        await query(
          `
          UPDATE articles
          SET title = ?, category = ?, excerpt = ?, author = ?, image = ?
          WHERE id = ?
          `,
          [title ?? null, category ?? null, excerpt ?? null, author ?? '', imageFilename, id]
        );
      } else {
        await query(
          `
          UPDATE articles
          SET title = ?, category = ?, excerpt = ?, author = ?
          WHERE id = ?
          `,
          [title ?? null, category ?? null, excerpt ?? null, author ?? '', id]
        );
      }

      return { ok: true, id };
    })
  );
r.post(
    '/toggle',
    endpoint(async (req) => {
      const { id, published } = req.body;
      if (!id) {
        throw new Error('Missing id');
      }

      const newDate =
        published === false
          ? null
          : new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      await query(
        `
        UPDATE articles
        SET date_published = ?
        WHERE id = ?
        `,
        [newDate, id]
      );

      return { ok: true, id, date: newDate };
    })
  );
r.post(
    '/create',
    endpoint(async (req) => {
      const { title, category, excerpt, author, date, image, imageUrl: incomingImageUrl } = req.body;

      const isoDate =
        date && typeof date === 'string' && date.length >= 10
          ? date.slice(0, 10)
          : null;

      ensureImagesDir();
      let imageFilename = null;
      if (image && typeof image === 'object' && typeof image.dataUrl === 'string') {
        imageFilename = saveDataUrlImage({ dataUrl: image.dataUrl, originalName: image.name });
      } else if (typeof incomingImageUrl === 'string' && incomingImageUrl.trim()) {
        imageFilename = path.basename(incomingImageUrl.trim()) || null;
      }

      const result = await query(
        `
        INSERT INTO articles
          (title, tag, image, link, blog_id, type, date_published, excerpt, author, category)
        VALUES
          (?, NULL, ?, '#', 1, 'medium', ?, ?, ?, ?)
        `,
        [title ?? null, imageFilename, isoDate, excerpt ?? null, author ?? '', category ?? null]
      );

      const id = result.insertId;

      return { ok: true, id };
    })
  );

  r.post(
    '/delete',
    endpoint(async (req) => {
      const { id } = req.body;
      if (!id) throw new Error('Missing id');
      await query(`DELETE FROM article_sections WHERE article_id = ?`, [id]);
      await query(`DELETE FROM related_articles WHERE article_id = ?`, [id]);
      await query(`DELETE FROM articles WHERE id = ?`, [id]);

      return { ok: true, id };
    })
  );
r.get(
    '/categories',
    endpoint(async () => {
      const rows = await query(
        `
        SELECT DISTINCT category
        FROM articles
        WHERE blog_id = 1 AND category IS NOT NULL AND category != ''
        ORDER BY category ASC
        `
      );
      return rows.map((row) => row.category);
    })
  );
r.get(
    '/articles',
    endpoint(async () => {
      const rows = await query(
        `
        SELECT id, title
        FROM articles
        WHERE blog_id = 1
        ORDER BY title ASC
        `
      );
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
      }));
    })
  );

  return r;
};

