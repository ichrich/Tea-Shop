const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
  const r = Router();
  r.get(
    '/:id',
    endpoint(async (req) => {
      const { id } = req.params;

      const rows = await query(
        `
        SELECT id, page_slug, title, content_json, image, image_alt, created_at, updated_at
        FROM pages_invitation
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

      if (!rows || rows.length === 0) {
        const err = new Error('Not found');
        err.status = 404;
        throw err;
      }

      const row = rows[0];
      let contentJson = row.content_json;

      if (typeof contentJson === 'string') {
        try {
          contentJson = JSON.parse(contentJson);
        } catch (e) {
        }
      }

      return {
        id: row.id,
        pageSlug: row.page_slug,
        title: row.title,
        contentJson,
        image: imageUrl(row.image),
        imageAlt: row.image_alt,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    })
  );
  return r;
};