const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
  const r = Router();
  r.use(authenticateToken);
r.post( 
    '/:id/toggle',
    endpoint(async (req) => {
      const { id } = req.params;  
      const { active } = req.body; 

      if (!id) {
        throw new Error('Необходимо указать ID товара.');
      }

      if (typeof active !== 'boolean') {
        throw new Error('Поле "active" должно быть boolean (true или false).');
      }

      const productExists = await query(`
        SELECT id FROM products WHERE id = ?
      `, [id]);
      if (productExists.length === 0) {
        return {status: 404, message: 'Товар с указанным ID не найден.'};
      }
      await query(`
        UPDATE products SET active = ? WHERE id = ?
      `, [active, id]);
      const updatedProduct = await query(`
        SELECT id, category_id, name, discription, active FROM products WHERE id = ?
      `, [id]);

      if (updatedProduct.length > 0) {
        return updatedProduct[0];
      } else {
        return {status: 500, message: 'Ошибка при получении обновленных данных товара.'};
      }
    })
  );

  return r;
};
