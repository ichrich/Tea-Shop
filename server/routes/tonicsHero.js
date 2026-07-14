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
      SELECT id, title_line1, title_line2, description, image_url, cta_text, cta_link, is_active
      FROM tonics_hero
      WHERE is_active = 1 AND id=?
      ORDER BY id DESC
      LIMIT 1
    `,[id]);
    return rows.map((r) => ({
      id: r.id,
      titleLine1: r.title_line1,
      titleLine2: r.title_line2,
      description: r.description,
      image: imageUrl(r.image_url),
      ctaText: r.cta_text,
      ctaLink: r.cta_link,
      isActive: Boolean(r.is_active),
    }));
  })
    );
    return r;
}
