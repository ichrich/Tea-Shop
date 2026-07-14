const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
   const r = Router();
   r.get(
    '/',
    endpoint(async () => {
      const rows = await query(`
        SELECT
          s.id AS set_id,
          s.title AS set_title,
          w.id AS item_id,
          w.text,
          w.size,
          w.placement_desktop,
          w.placement_tablet,
          w.placement_mobile
        FROM overlay_words w
        JOIN ingredient_sets s ON w.set_id = s.id
      `);
      if (!rows || rows.length === 0) {
        return { title: '', items: [] };
      }
      const firstSetTitle = rows[0].set_title;
      const items = rows.map((r) => ({
        id: r.item_id,
        text: r.text,
        size: r.size,
        placement_desktop: r.placement_desktop,
        placement_tablet: r.placement_tablet,
        placement_mobile: r.placement_mobile,
      }));
      return {
        title: firstSetTitle,
        items,
      };
    })
    );
    return r;
}
