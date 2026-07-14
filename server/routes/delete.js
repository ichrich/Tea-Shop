const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
module.exports = (query) => {
  const r = Router();
  r.use(authenticateToken);
r.delete(
    '/:id',
    endpoint(async (req) => {
      const { id } = req.params;
      if (!id) {
        return { ok: false, error: 'Missing id' };
      }
      await query('DELETE FROM `products` WHERE `id`=?', [id]);

      return { ok: true, id };
    })
  );

  return r;
};
