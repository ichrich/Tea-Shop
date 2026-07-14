const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
  const r = Router();

  r.get(
    '/:id',
    endpoint(async (req) => {
      const { id } = req.params;

      const heroRows = await query(
        `SELECT
           th.id AS id,
           th.title_line1 AS titleLine1,
           th.title_line2 AS titleLine2,
           th.description AS description,
           th.image_url AS imageUrl,
           th.cta_text AS ctaText,
           th.cta_link AS ctaLink,
           th.is_active AS isActive
         FROM tonics_hero th
         WHERE th.id = ?`,
        [id]
      );
      const h = heroRows[0] ?? null;

      const hero = h
        ? {
            id: h.id,
            title: h.titleLine1 ?? '',
            subtitle: h.titleLine2 ?? '',
            description: h.description ?? '',
            imageUrl: imageUrl(h.imageUrl),
            cta: {
              text: h.ctaText ?? '',
              link: h.ctaLink ?? ''
            },
            isActive: !!h.isActive
          }
        : null;

      const seoRows = await query(
        `SELECT
           ts.id AS id,
           ts.page_slug AS pageSlug,
           ts.title AS title,
           ts.is_active AS isActive,
           ts.locale AS locale,
           ts.created_at AS createdAt,
           ts.updated_at AS updatedAt
         FROM tonics_seo_text ts
         WHERE ts.id = ?`,
        [id]
      );
      const seoRow = seoRows[0] ?? null;

      const seoBlocks = await query(
        `SELECT
           tbst.block_order AS blockOrder,
           tbst.subtitle AS subtitle,
           tbst.text AS text,
           tbst.highlight AS highlight
         FROM tonics_seo_text_block tbst
         WHERE tbst.tonics_seo_text_id = ?
         ORDER BY tbst.block_order ASC`,
        [id]
      );

      const blocks = (seoBlocks || [])
        .filter((b) => b.blockOrder != null)
        .map((b) => ({
          blockOrder: b.blockOrder,
          subtitle: b.subtitle,
          text: b.text,
          highlight: b.highlight
        }));

      const payload = {
        hero,
        seo: {
          title: seoRow?.title ?? '',
          pageSlug: seoRow?.pageSlug ?? '',
          locale: seoRow?.locale ?? '',
          blocks
        }
      };

      return payload;
    })
  );

  return r;
};
