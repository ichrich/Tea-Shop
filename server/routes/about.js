const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');
module.exports = (query) => {
   const r = Router();
r.get(
    '/',
    endpoint(async () => {
      const aboutRows = await query(`
        SELECT
          a.title AS title,
          a.description AS description,
          a.philosophy_title AS philosophyTitle
        FROM about_section a
        LIMIT 1
      `);
      const philosophyRows = await query(`
        SELECT term AS term, \`desc\` as \`desc\`
        FROM philosophy_item
      `);
      return {
        title: aboutRows[0]?.title || '',
        description: aboutRows[0]?.description || '',
        philosophyTitle: aboutRows[0]?.philosophyTitle || '',
        philosophyItems: philosophyRows.map((r) => ({
          term: r.term,
          desc: r.desc,
        })),
      };
    })
    );
    return r;
}
