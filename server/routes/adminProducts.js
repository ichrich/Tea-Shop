const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');
module.exports = (query) => {
  const r = Router();
r.get(
    '/',
    endpoint(async () => {
      console.log('[adminProducts] GET /api/adminProducts called');
      const rows = await query(`
        SELECT
          p.id,
          p.name,
          p.price,
          p.image,
          p.active,
          p.views,
          p.quantity,
          p.category,
          p.type
        FROM products p
        ORDER BY p.id DESC
      `);

      const productIds = rows.map((p) => p.id).filter(Boolean);
      let galleryByProductId = new Map();
      if (productIds.length > 0) {
        try {
          const placeholders = productIds.map(() => '?').join(',');
          const galleryRows = await query(
            `
              SELECT product_id, image, sort_order
              FROM product_images
              WHERE product_id IN (${placeholders})
              ORDER BY product_id ASC, sort_order ASC, id ASC
            `,
            productIds
          );

          galleryByProductId = galleryRows.reduce((acc, row) => {
            const key = row.product_id;
            const current = acc.get(key) || [];
            current.push(imageUrl(row.image));
            acc.set(key, current);
            return acc;
          }, new Map());
        } catch (e) {
          const code = e?.code || e?.errno;
          if (code === 'ER_NO_SUCH_TABLE' || code === 1146) {
            console.warn('[adminProducts] product_images table missing; returning products without gallery');
            galleryByProductId = new Map();
          } else {
            throw e;
          }
        }
      }

      const mapped = rows.map((p) => {
        const quantity = Number(p.quantity) || 0;
        const cover = imageUrl(p.image);
        const gallery = galleryByProductId.get(p.id) || [];
        return {
          id: p.id,
          productId: String(p.id),
          name: p.name || '',
          category: p.type || p.category || '',
          usefull: p.category || '',
          views: Number(p.views) || 0,
          price: Number(p.price) || 0,
          quantity,
          active: Boolean(p.active),
          status: quantity > 0 ? 'in_stock' : 'out_of_stock',
          date: '',
          image: cover,
          images: [cover, ...gallery].filter(Boolean),
        };
      });
      console.log(`[adminProducts] fetched rows: ${mapped.length}`);
      return mapped;
    })
  );

  return r;
};