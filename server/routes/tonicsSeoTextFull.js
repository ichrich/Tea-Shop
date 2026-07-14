const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
   const r = Router();
   r.get(
    '/:id',
    endpoint(async (req) => {
  const { id } = req.params;
  const rows = await query(`
      SELECT
        ts.id AS id,
        ts.page_slug AS pageSlug,
        ts.title AS title,
        ts.is_active AS isActive,
        ts.locale AS locale,
        ts.created_at AS createdAt,
        ts.updated_at AS updatedAt,
        tbst.block_order AS blockOrder,
        tbst.subtitle AS subtitle,
        tbst.text AS text,
        tbst.highlight AS highlight
      FROM tonics_seo_text ts
      LEFT JOIN tonics_seo_text_block tbst ON tbst.tonics_seo_text_id = ts.id
      WHERE ts.id = ?
      ORDER BY tbst.block_order ASC`
  , [id]);
  const page = rows[0] ?? null;
  const payload = {
      title: page ? page.title : '',
      items: rows
        .filter(r => r.blockOrder != null)
        .map(r => ({
          blockOrder: r.blockOrder,
          subtitle: r.subtitle,
          text: r.text,
          highlight: r.highlight
        }))
    };
  return payload;
  }));
  return r;
}
