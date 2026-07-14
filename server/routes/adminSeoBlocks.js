const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
const { imageUrl } = require('../utils/image');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const IMAGES_DIR = path.resolve(__dirname, '../images');
const ALLOWED_FORMATS = new Set(['photo+text', 'text+text']);

const SEO_PAGES = [
	{ pageKey: 'home', title: 'Главная' },
	{ pageKey: 'catalog', title: 'Каталог' },
	{ pageKey: 'type-of-tonic', title: 'Вид тоника' },
	{ pageKey: 'about-company', title: 'О компании' },
	{ pageKey: 'product', title: 'Карточка продукта' },
	{ pageKey: 'partners', title: 'Партнерам' },
	{ pageKey: 'tonics', title: 'Тоники' },
];

const SEO_PAGES_MAP = Object.fromEntries(SEO_PAGES.map(x => [x.pageKey, x.title]));

function dataURLToBuffer(dataUrl) {
  const m = /^data:(.*?);base64,(.*)$/i.exec(dataUrl || '');
  if (!m) return Buffer.from(String(dataUrl || ''));
  return Buffer.from(m[2], 'base64');
}

async function saveDataUrlToFile(dataUrl, dir, filename) {
  const buf = dataURLToBuffer(dataUrl);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buf);
  return filename;
}

let cachedSeoPages = null;

function scanSeoTextPageKeys() {
	const pagesDir = path.resolve(__dirname, '../../front/src');

	const keys = new Set();

	const walk = (dir) => {
		let entries;
		try {
			entries = fsSync.readdirSync(dir, { withFileTypes: true });
		} catch (_) {
			return;
		}

		for (const ent of entries) {
			const full = path.join(dir, ent.name);
			if (ent.isDirectory()) {
				if (ent.name === 'node_modules') continue;
				walk(full);
			} else if (ent.isFile()) {
				if (!/\.(jsx|tsx|js|ts)$/.test(ent.name)) continue;
				let content = '';
				try {
					content = fsSync.readFileSync(full, 'utf8');
				} catch (_) {
					continue;
				}
				const re1 = /<SeoText[^>]*\bpageKey\s*=\s*["']([^"']+)["']/g;
				for (const m of content.matchAll(re1)) {
					if (m?.[1]) keys.add(String(m[1]));
				}
				const re2 = /<SeoText[^>]*\bpageKey\s*=\s*{['"]([^'"]+)['"]}/g;
				for (const m of content.matchAll(re2)) {
					if (m?.[1]) keys.add(String(m[1]));
				}
			}
		}
	};

	walk(pagesDir);
	if (keys.size === 0) {
		for (const p of SEO_PAGES) keys.add(p.pageKey);
	}

	return Array.from(keys);
}

async function getSeoPagesForSeeding(query) {
	if (cachedSeoPages) return cachedSeoPages;

	let foundKeys = [];
	try {
		foundKeys = scanSeoTextPageKeys();
	} catch (_) {
		foundKeys = SEO_PAGES.map(x => x.pageKey);
	}

	cachedSeoPages = foundKeys.map(pageKey => ({
		pageKey,
		title: SEO_PAGES_MAP[pageKey] || pageKey,
	}));
	return cachedSeoPages;
}

async function ensureSchema(query) {
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

  const pageTitleCol = await query(`SHOW COLUMNS FROM seo_home_blocks LIKE 'page_title'`);
  if (!Array.isArray(pageTitleCol) || pageTitleCol.length === 0) {
    await query(`ALTER TABLE seo_home_blocks ADD COLUMN page_title VARCHAR(255) NOT NULL DEFAULT ''`);
  }
  const formatCol = await query(`SHOW COLUMNS FROM seo_home_blocks LIKE 'format'`);
  if (!Array.isArray(formatCol) || formatCol.length === 0) {
    await query(`ALTER TABLE seo_home_blocks ADD COLUMN format VARCHAR(32) NOT NULL DEFAULT 'photo+text'`);
  }
  const textLeftCol = await query(`SHOW COLUMNS FROM seo_home_blocks LIKE 'text_left'`);
  if (!Array.isArray(textLeftCol) || textLeftCol.length === 0) {
    await query(`ALTER TABLE seo_home_blocks ADD COLUMN text_left LONGTEXT NULL`);
  }
}

async function ensureSeedRows(query) {
  const seoPages = await getSeoPagesForSeeding(query);
  for (const row of seoPages) {
    await query(
      `
      INSERT INTO seo_home_blocks (page_key, page_title, format, image, text_left, text, is_active)
      VALUES (?, ?, 'photo+text', NULL, '', '', 1)
      ON DUPLICATE KEY UPDATE page_title = VALUES(page_title)
      `,
      [row.pageKey, row.title]
    );
  }
}

module.exports = (query) => {
  const r = Router();
  ensureSchema(query)
    .then(() => ensureSeedRows(query))
    .catch((err) => {
      console.error('[adminSeoBlocks] init failed:', err?.message || err);
    });

  r.use(authenticateToken);

  r.get(
    '/',
    endpoint(async () => {
      await ensureSchema(query);
      await ensureSeedRows(query);
      const rows = await query(`
        SELECT id, page_key, page_title, format, image, text_left, text, is_active, updated_at
        FROM seo_home_blocks
        ORDER BY page_title ASC, id ASC
      `);
      return (rows || []).map((row) => ({
        id: row.id,
        pageKey: row.page_key,
        title: row.page_title || row.page_key,
        format: ALLOWED_FORMATS.has(row.format) ? row.format : 'photo+text',
        image: row.image ? imageUrl(row.image) : '',
        textLeft: row.text_left || '',
        text: row.text || '',
        isActive: Number(row.is_active) !== 0,
        updatedAt: row.updated_at || null,
      }));
    })
  );

  r.post(
    '/:pageKey',
    endpoint(async (req, res) => {
      await ensureSchema(query);
      await ensureSeedRows(query);

      const pageKey = String(req.params.pageKey || '').trim();
      if (!pageKey) return res.status(400).json({ error: 'Некорректный pageKey' });

      const text = typeof req.body?.text === 'string' ? req.body.text : null;
      const textLeft = typeof req.body?.textLeft === 'string' ? req.body.textLeft : null;
      const isActive = typeof req.body?.isActive === 'boolean' ? req.body.isActive : null;
      const format = typeof req.body?.format === 'string' ? req.body.format.trim().toLowerCase() : null;
      const imageInput = req.body?.image;

      const updates = [];
      const params = [];

      if (text !== null) {
        updates.push('text = ?');
        params.push(text);
      }
      if (textLeft !== null) {
        updates.push('text_left = ?');
        params.push(textLeft);
      }
      if (isActive !== null) {
        updates.push('is_active = ?');
        params.push(isActive ? 1 : 0);
      }
      if (format !== null) {
        if (!ALLOWED_FORMATS.has(format)) {
          return res.status(400).json({ error: 'Некорректный формат' });
        }
        updates.push('format = ?');
        params.push(format);
      }
      if (imageInput && typeof imageInput === 'object') {
        if (imageInput.dataUrl) {
          const ext = path.extname(imageInput.name || '') || '.png';
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
          await saveDataUrlToFile(imageInput.dataUrl, IMAGES_DIR, filename);
          updates.push('image = ?');
          params.push(filename);
        } else if (typeof imageInput.url === 'string' && imageInput.url.trim()) {
          updates.push('image = ?');
          params.push(path.basename(imageInput.url.trim()));
        }
      } else if (imageInput === null) {
        updates.push('image = NULL');
      } else if (format === 'text+text') {
        updates.push('image = NULL');
      }

      if (!updates.length) return res.status(400).json({ error: 'Нет полей для обновления' });

      params.push(pageKey);
      await query(`UPDATE seo_home_blocks SET ${updates.join(', ')} WHERE page_key = ?`, params);
      return { ok: true, pageKey };
    })
  );

  return r;
};

