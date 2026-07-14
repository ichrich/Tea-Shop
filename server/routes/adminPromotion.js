const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
const { imageUrl } = require('../utils/image');
const path = require('path');
const fs = require('fs').promises;

const FORMAT_DEFAULT = 'text+text';
const STATUS_DEFAULT = 'published';
const ALLOWED_FORMATS = new Set(['text+text', 'photo+text']);
const ALLOWED_STATUSES = new Set(['draft', 'published', 'archived']);
const IMAGES_DIR = path.resolve(__dirname, '../images');

function dataURLToBuffer(dataUrl) {
  const m = /^data:(.*?);base64,(.*)$/i.exec(dataUrl);
  if (!m) return Buffer.from(dataUrl);
  return Buffer.from(m[2], 'base64');
}

async function saveDataUrlToFile(dataUrl, dir, filename) {
  const buf = dataURLToBuffer(dataUrl);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buf);
  return filename;
}

async function ensurePromotionSchema(query) {
  const cols = await query(`SHOW COLUMNS FROM cms_pages LIKE 'promotion_format'`);
  if (!Array.isArray(cols) || cols.length === 0) {
    await query(
      `ALTER TABLE cms_pages ADD COLUMN promotion_format VARCHAR(32) NOT NULL DEFAULT '${FORMAT_DEFAULT}'`
    );
  }
  const imageCols = await query(`SHOW COLUMNS FROM cms_pages LIKE 'promotion_image'`);
  if (!Array.isArray(imageCols) || imageCols.length === 0) {
    await query(`ALTER TABLE cms_pages ADD COLUMN promotion_image VARCHAR(512) NULL`);
  }
  const leftCols = await query(`SHOW COLUMNS FROM cms_pages LIKE 'promotion_left_enabled'`);
  if (!Array.isArray(leftCols) || leftCols.length === 0) {
    await query(`ALTER TABLE cms_pages ADD COLUMN promotion_left_enabled TINYINT(1) NOT NULL DEFAULT 1`);
  }
  const rightCols = await query(`SHOW COLUMNS FROM cms_pages LIKE 'promotion_right_enabled'`);
  if (!Array.isArray(rightCols) || rightCols.length === 0) {
    await query(`ALTER TABLE cms_pages ADD COLUMN promotion_right_enabled TINYINT(1) NOT NULL DEFAULT 1`);
  }
}

module.exports = (query) => {
  const r = Router();
  r.use(authenticateToken);

  r.get(
    '/',
    endpoint(async () => {
      await ensurePromotionSchema(query);
      const rows = await query(`
        SELECT id, slug, title, status, promotion_format, promotion_image, promotion_left_enabled, promotion_right_enabled, updated_at
        FROM cms_pages
        ORDER BY updated_at DESC, id DESC
      `);

      return (rows || []).map((row) => ({
        id: row.id,
        slug: row.slug || '',
        title: row.title || '',
        format: ALLOWED_FORMATS.has(row.promotion_format) ? row.promotion_format : FORMAT_DEFAULT,
        status: ALLOWED_STATUSES.has(row.status) ? row.status : STATUS_DEFAULT,
        image: imageUrl(row.promotion_image),
        leftEnabled: Number(row.promotion_left_enabled) !== 0,
        rightEnabled: Number(row.promotion_right_enabled) !== 0,
        updatedAt: row.updated_at || null,
      }));
    })
  );

  r.post(
    '/:id',
    endpoint(async (req, res) => {
      await ensurePromotionSchema(query);
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Некорректный id' });
      }

      const nextFormat = String(req.body?.format || '').trim().toLowerCase();
      const nextStatus = String(req.body?.status || '').trim().toLowerCase();
      const leftEnabled =
        typeof req.body?.leftEnabled === 'boolean' ? req.body.leftEnabled : null;
      const rightEnabled =
        typeof req.body?.rightEnabled === 'boolean' ? req.body.rightEnabled : null;
      const imageInput = req.body?.image;
      const updates = [];
      const params = [];

      if (nextFormat) {
        if (!ALLOWED_FORMATS.has(nextFormat)) {
          return res.status(400).json({ error: 'Некорректный формат' });
        }
        updates.push('promotion_format = ?');
        params.push(nextFormat);
      }

      if (nextStatus) {
        if (!ALLOWED_STATUSES.has(nextStatus)) {
          return res.status(400).json({ error: 'Некорректный статус' });
        }
        updates.push('status = ?');
        params.push(nextStatus);
      }
      if (leftEnabled !== null) {
        updates.push('promotion_left_enabled = ?');
        params.push(leftEnabled ? 1 : 0);
      }
      if (rightEnabled !== null) {
        updates.push('promotion_right_enabled = ?');
        params.push(rightEnabled ? 1 : 0);
      }
      if (imageInput && typeof imageInput === 'object') {
        if (imageInput.dataUrl) {
          const ext = path.extname(imageInput.name || '') || '.png';
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          await saveDataUrlToFile(imageInput.dataUrl, IMAGES_DIR, filename);
          updates.push('promotion_image = ?');
          params.push(filename);
        } else if (typeof imageInput.url === 'string' && imageInput.url.trim()) {
          const fileName = path.basename(imageInput.url.trim());
          updates.push('promotion_image = ?');
          params.push(fileName);
        }
      } else if (imageInput === null) {
        updates.push('promotion_image = NULL');
      }

      if (!updates.length) {
        return res.status(400).json({ error: 'Нет полей для обновления' });
      }

      params.push(id);
      await query(`UPDATE cms_pages SET ${updates.join(', ')} WHERE id = ?`, params);
      return { ok: true, id };
    })
  );

  r.delete(
    '/:id',
    endpoint(async (req, res) => {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Некорректный id' });
      }
      await query(`DELETE FROM cms_pages WHERE id = ?`, [id]);
      return { ok: true, id };
    })
  );

  return r;
};

