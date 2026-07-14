const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
   const r = Router();
   r.get(
    '/',
    endpoint(async () => {
      const rows = await query(`
        SELECT i.name, i.image, i.description
        FROM industries i
      `);
      return rows.map((r) => ({
        name: r.name,
        image: imageUrl(r.image),
        description: r.description,
      }));
    })
    );
    return r;
}
