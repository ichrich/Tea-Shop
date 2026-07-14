const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');
module.exports = (query) => {
   const r = Router();
r.get(
    '/',
    endpoint(async () => {
      const locale = 'ru';
      const navRows = await query(`
        SELECT id, label AS label, url AS url, sort_order AS sortOrder
        FROM site_navigation
        WHERE is_active = 1
          AND locale = ?
        ORDER BY sort_order ASC
      `, [locale]);
      const items = navRows.map((r) => ({
        id: r.id,
        label: r.label,
        url: r.url,
        sortOrder: r.sortOrder,
      }));
      return { items };
    })
    );  
    return r;
}
