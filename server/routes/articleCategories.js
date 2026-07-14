const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
  const r = Router();
  r.use(authenticateToken);
r.get(
    '/',
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
r.post(
    '/create',
    endpoint(async (req) => {
      const { name } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        throw new Error('Category name is required');
      }
      const existing = await query(
        `
        SELECT DISTINCT category
        FROM articles
        WHERE blog_id = 1 AND category = ?
        `,
        [name.trim()]
      );

      if (existing.length > 0) {
        return { ok: true, message: 'Category already exists', category: name.trim() };
      }
      return { ok: true, category: name.trim() };
    })
  );
r.post(
    '/update',
    endpoint(async (req) => {
      const { oldName, newName } = req.body;

      if (!oldName || !newName) {
        throw new Error('oldName and newName are required');
      }

      await query(
        `
        UPDATE articles
        SET category = ?
        WHERE blog_id = 1 AND category = ?
        `,
        [newName.trim(), oldName.trim()]
      );

      return { ok: true };
    })
  );
r.post(
    '/delete',
    endpoint(async (req) => {
      const { name } = req.body;

      if (!name) {
        throw new Error('Category name is required');
      }

      await query(
        `
        UPDATE articles
        SET category = NULL
        WHERE blog_id = 1 AND category = ?
        `,
        [name.trim()]
      );

      return { ok: true };
    })
  );

  return r;
};
