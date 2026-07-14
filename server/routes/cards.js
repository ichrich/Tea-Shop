const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
module.exports = (query) => {
  const r = Router();
r.get(
    '/',
    endpoint(async (req) => {
      const rows = await query(
        `
        SELECT
          id,
          page_slug AS pageSlug,
          card_order AS cardOrder,
          title,
          content
        FROM product_info_cards
        `,
        []
      );
      const payload = rows
      return payload;
    })
  );

  return r;
};
