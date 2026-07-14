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
        SELECT id, title, text1, text2
        FROM seo_text 
        WHERE id=?
        LIMIT 1
      `,[id]);
      const r = rows[0] || { title: '', text1: '', text2: '' };
      return {
        title: r.title,
        text1: r.text1,
        text2: r.text2,
      };
    })
    );
    return r;
}
