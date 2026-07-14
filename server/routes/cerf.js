const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
   const r = Router();
   r.use(authenticateToken);
r.get(
    '/',
    endpoint(async (req) => {
      const rows = await query(`
        SELECT id, product_id, header, url FROM cerf
      `,[]);
      return rows.map((r) => ({
        id:r.id,
        header: r.header,
        product_id:r.product_id,
        url: r.url,
      }));
    })
    );
    return r;
}
