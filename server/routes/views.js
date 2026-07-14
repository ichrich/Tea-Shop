const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
module.exports = (query) => {
  const r = Router();
r.post(
    '/:id',
    endpoint(async (req) => {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId) || productId <= 0) {
        return { message: 'Некорректный ID продукта' }, 400;
      }
      try {
        const result = await query(
          `
          UPDATE products
          SET views = views + 1
          WHERE id = ?
          `,
          [productId]
        );
        if (result.affectedRows === 0) {
          return { message: 'Продукт не найден' }, 404;
        }
        await query(
          `
          INSERT INTO views_date (product_id, date)
          VALUES (?, NOW())
          `,
          [productId]
        );
        return { message: 'Просмотры продукта успешно обновлены' }, 200;
      } catch (error) {
        console.error('Ошибка при обработке просмотров:', error);
        return { message: 'Произошла ошибка при обновлении просмотров' }, 500;
      }
    })
  );
  return r;
};