const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
  const r = Router();

  r.use(authenticateToken);

  const ensureAuthorsTable = async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS article_authors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  };

  r.get(
    '/',
    endpoint(async () => {
      await ensureAuthorsTable();
      const articleRows = await query(
        `
        SELECT DISTINCT author
        FROM articles
        WHERE blog_id = 1 AND author IS NOT NULL AND author != ''
        ORDER BY author ASC
        `
      );
      const tableRows = await query(
        `
        SELECT name
        FROM article_authors
        ORDER BY name ASC
        `
      );
      const merged = [
        ...articleRows.map((row) => row.author),
        ...tableRows.map((row) => row.name),
      ].filter(Boolean);
      return Array.from(new Set(merged)).sort((a, b) => a.localeCompare(b, 'ru'));
    })
  );

  r.post(
    '/create',
    endpoint(async (req) => {
      await ensureAuthorsTable();
      const { name } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        throw new Error('Author name is required');
      }

      const trimmed = name.trim();
      const existing = await query(`SELECT id FROM article_authors WHERE name = ? LIMIT 1`, [trimmed]);
      if (existing.length > 0) {
        return { ok: true, message: 'Author already exists', author: trimmed };
      }
      await query(`INSERT INTO article_authors (name) VALUES (?)`, [trimmed]);
      return { ok: true, author: trimmed };
    })
  );

  r.post(
    '/update',
    endpoint(async (req) => {
      await ensureAuthorsTable();
      const { oldName, newName } = req.body;
      if (!oldName || !newName) {
        throw new Error('oldName and newName are required');
      }
      await query(`UPDATE article_authors SET name = ? WHERE name = ?`, [newName.trim(), oldName.trim()]);
      await query(
        `
        UPDATE articles
        SET author = ?
        WHERE blog_id = 1 AND author = ?
        `,
        [newName.trim(), oldName.trim()]
      );
      return { ok: true };
    })
  );

  r.post(
    '/delete',
    endpoint(async (req) => {
      await ensureAuthorsTable();
      const { name } = req.body;
      if (!name) {
        throw new Error('Author name is required');
      }
      await query(`DELETE FROM article_authors WHERE name = ?`, [name.trim()]);
      await query(
        `
        UPDATE articles
        SET author = ''
        WHERE blog_id = 1 AND author = ?
        `,
        [name.trim()]
      );
      return { ok: true };
    })
  );

  return r;
};

