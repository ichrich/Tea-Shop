const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
   const r = Router();
   r.get(
    '/',
    endpoint(async () => {
      const partnerRows = await query(`
        SELECT id, title
        FROM partners
      `);
      const itemRows = await query(`
        SELECT id, partner_id, logo, link, name
        FROM partner_items
      `);
      const items = Array.isArray(itemRows)
        ? itemRows.map((it) => ({
            id: it.id,
            partner_id: it.partner_id,
            logo: imageUrl(it.logo),
            link: it.link,
            name: it.name,
          }))
        : [];
      return {
        title: partnerRows[0]?.title || '',
        items,
      };
    })
    );
    return r;
}
