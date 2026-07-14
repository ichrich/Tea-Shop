const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = (query) => {
  const r = Router();

  r.use(authenticateToken);

  const ensureColumns = async () => {
    const cols = await query(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins'
      `
    );
    const set = new Set(cols.map((c) => c.COLUMN_NAME));
    if (!set.has('full_name')) {
      await query(`ALTER TABLE admins ADD COLUMN full_name varchar(255) NULL AFTER email`);
    }
    if (!set.has('role')) {
      await query(`ALTER TABLE admins ADD COLUMN role varchar(255) NULL AFTER full_name`);
    }
  };

  r.get(
    '/',
    endpoint(async () => {
      await ensureColumns();
      const rows = await query(
        `
        SELECT id, full_name, username, email, role, is_active
        FROM admins
        ORDER BY id DESC
        `
      );
      return rows.map((a) => ({
        id: a.id,
        fullName: a.full_name || '',
        username: a.username,
        email: a.email || '',
        role: a.role || 'Администрирование',
        isActive: !!a.is_active,
      }));
    })
  );

  r.post(
    '/create',
    endpoint(async (req) => {
      await ensureColumns();
      const { fullName, username, password, email, role } = req.body || {};

      if (!username || typeof username !== 'string' || !username.trim()) {
        const e = new Error('username is required');
        e.status = 400;
        throw e;
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        const e = new Error('password must be at least 6 chars');
        e.status = 400;
        throw e;
      }

      const existing = await query(`SELECT id FROM admins WHERE username = ? LIMIT 1`, [
        username.trim(),
      ]);
      if (existing.length) {
        const e = new Error('username already exists');
        e.status = 400;
        throw e;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const result = await query(
        `
        INSERT INTO admins (username, password_hash, email, full_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
        `,
        [
          username.trim(),
          passwordHash,
          (email || null),
          (fullName || null),
          (role || 'Администратор'),
        ]
      );

      return { ok: true, id: result.insertId };
    })
  );

  r.post(
    '/update',
    endpoint(async (req) => {
      await ensureColumns();
      const { id, fullName, username, email, role, password, isActive } = req.body || {};
      if (!id) {
        const e = new Error('id is required');
        e.status = 400;
        throw e;
      }
      if (username && typeof username === 'string') {
        const dup = await query(
          `SELECT id FROM admins WHERE username = ? AND id != ? LIMIT 1`,
          [username.trim(), id]
        );
        if (dup.length) {
          const e = new Error('username already exists');
          e.status = 400;
          throw e;
        }
      }

      if (password && typeof password === 'string' && password.length >= 6) {
        const passwordHash = await bcrypt.hash(password, 10);
        await query(
          `
          UPDATE admins
          SET full_name = ?, username = COALESCE(?, username), email = ?, role = ?, password_hash = ?
          WHERE id = ?
          `,
          [
            fullName ?? null,
            username ? username.trim() : null,
            email ?? null,
            role ?? null,
            passwordHash,
            id,
          ]
        );
      } else {
        await query(
          `
          UPDATE admins
          SET full_name = ?, username = COALESCE(?, username), email = ?, role = ?
          WHERE id = ?
          `,
          [fullName ?? null, username ? username.trim() : null, email ?? null, role ?? null, id]
        );
      }

      if (typeof isActive === 'boolean') {
        await query(`UPDATE admins SET is_active = ? WHERE id = ?`, [isActive ? 1 : 0, id]);
      }
      return { ok: true };
    })
  );

  r.post(
    '/toggle',
    endpoint(async (req) => {
      const { id, isActive } = req.body || {};
      if (!id || typeof isActive !== 'boolean') {
        const e = new Error('id and isActive are required');
        e.status = 400;
        throw e;
      }
      await query(`UPDATE admins SET is_active = ? WHERE id = ?`, [isActive ? 1 : 0, id]);
      return { ok: true };
    })
  );

  r.post(
    '/delete',
    endpoint(async (req) => {
      const { id } = req.body || {};
      if (!id) {
        const e = new Error('id is required');
        e.status = 400;
        throw e;
      }
      await query(`DELETE FROM admins WHERE id = ?`, [id]);
      return { ok: true };
    })
  );

  r.post(
    '/resetPassword',
    endpoint(async (req) => {
      const { id } = req.body || {};
      if (!id) {
        const e = new Error('id is required');
        e.status = 400;
        throw e;
      }
      const newPassword = crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await query(`UPDATE admins SET password_hash = ? WHERE id = ?`, [passwordHash, id]);
      return { ok: true, password: newPassword };
    })
  );

  return r;
};

