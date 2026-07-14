const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
  const r = Router();

  const ensureTable = async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS seo_home_blocks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_key VARCHAR(120) NOT NULL UNIQUE,
        page_title VARCHAR(255) NOT NULL DEFAULT '',
        format VARCHAR(32) NOT NULL DEFAULT 'photo+text',
        image VARCHAR(512) NULL,
        text_left LONGTEXT NULL,
        text LONGTEXT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  };

  const ensurePageTitleColumn = async () => {
    const pageTitleCol = await query(`SHOW COLUMNS FROM seo_home_blocks LIKE 'page_title'`);
    if (!Array.isArray(pageTitleCol) || pageTitleCol.length === 0) {
      await query(`ALTER TABLE seo_home_blocks ADD COLUMN page_title VARCHAR(255) NOT NULL DEFAULT ''`);
    }
  };
  const ensureFormatColumn = async () => {
    const formatCol = await query(`SHOW COLUMNS FROM seo_home_blocks LIKE 'format'`);
    if (!Array.isArray(formatCol) || formatCol.length === 0) {
      await query(`ALTER TABLE seo_home_blocks ADD COLUMN format VARCHAR(32) NOT NULL DEFAULT 'photo+text'`);
    }
  };
  const ensureTextLeftColumn = async () => {
    const textLeftCol = await query(`SHOW COLUMNS FROM seo_home_blocks LIKE 'text_left'`);
    if (!Array.isArray(textLeftCol) || textLeftCol.length === 0) {
      await query(`ALTER TABLE seo_home_blocks ADD COLUMN text_left LONGTEXT NULL`);
    }
  };
  Promise.resolve()
    .then(() => ensureTable())
    .then(() => ensurePageTitleColumn())
    .then(() => ensureFormatColumn())
    .then(() => ensureTextLeftColumn())
    .catch((err) => {
    console.error('[seoHome] Failed to ensure seo_home_blocks table:', err?.message || err);
  });

  r.get(
    '/:pageKey',
    endpoint(async (req) => {
      await ensureTable();
      await ensurePageTitleColumn();
      await ensureFormatColumn();
      await ensureTextLeftColumn();
      const pageKey = String(req.params.pageKey || '').trim() || 'home';
      const rows = await query(
        `
        SELECT id, page_key, format, image, text_left, text, is_active
        FROM seo_home_blocks
        WHERE page_key = ?
        LIMIT 1
        `,
        [pageKey]
      );
      const row = rows[0] || null;
      return {
        id: row?.id || null,
        pageKey,
        format: row?.format || 'photo+text',
        image: row?.image ? imageUrl(row.image) : '',
        textLeft: row?.text_left || '',
        text: row?.text || '',
        isActive: row ? !!row.is_active : true,
      };
    })
  );

  return r;
};

