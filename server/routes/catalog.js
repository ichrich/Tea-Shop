const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');
module.exports = (query) => {
  const r = Router();
  r.get(
    '/all',
    endpoint(async () => {
      const products = await query(`
        SELECT id, name, price, image, size, category_id, discription, active, views, quantity, category, type
        FROM products
        WHERE active = 1
        ORDER BY id DESC
        LIMIT 8
      `);

      return {
        title: 'Все тоники',
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: imageUrl(p.image),
          size: p.size,
          category_id: p.category_id,
          discription: p.discription,
          active: p.active,
          views: p.views,
          quantity: p.quantity,
          category: p.category,
          type: p.type,
        })),
      };
    })
  );
r.get(
    '/product/:id',
    endpoint(async (req) => {
      const { id } = req.params;
      const productRows = await query(`
        SELECT id, name, price, image, size, category_id, discription, active, views, quantity, category, type
        FROM products
        WHERE id = ? AND active = 1
      `, [id]);

      if (productRows.length === 0) {
        return { error: 'Товар не найден' };
      }

      const product = productRows[0];
      const characteristics = await query(`
        SELECT id, name, description
        FROM characteristic
        WHERE product_id = ?
        ORDER BY id ASC
      `, [id]);
      const certificates = await query(`
        SELECT id, header, url
        FROM cerf
        WHERE product_id = ?
        ORDER BY id ASC
      `, [id]);
      const relatedProducts = await query(`
        SELECT id, name, price, image, size, category_id, discription, category, type
        FROM products
        WHERE category_id = ? AND id != ? AND active = 1
        ORDER BY id DESC
        LIMIT 3
      `, [product.category_id, id]);

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageUrl(product.image),
        size: product.size,
        category_id: product.category_id,
        description: product.discription,
        category: product.category,
        type: product.type,
        quantity: product.quantity,
        characteristics: characteristics.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description,
        })),
        certificates: certificates.map(c => ({
          id: c.id,
          title: c.header,
          url: imageUrl(c.url),
        })),
        relatedProducts: relatedProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: imageUrl(p.image),
          size: p.size,
          category: p.category,
        })),
      };
    })
  );

  r.get(
    '/:id',
    endpoint(async (req) => {
      const { id } = req.params;
      const { category } = req.query;

      const categories = await query(`
        SELECT id, name
        FROM product_categories
        WHERE id=?
      `, [id]);

      let products;
      if (category && category !== 'all') {
        products = await query(`
          SELECT id, name, price, image, size, category_id, discription, active, views, quantity, category, type
          FROM products
          WHERE category_id=? AND name=? AND active = 1
          ORDER BY id DESC
          LIMIT 8
        `, [id, category]);
      } else {
        products = await query(`
          SELECT id, name, price, image, size, category_id, discription, active, views, quantity, category, type
          FROM products
          WHERE category_id=? AND active = 1
          ORDER BY id DESC
          LIMIT 8
        `, [id]);
      }

      return {
        title: categories[0]?.name,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: imageUrl(p.image),
          size: p.size,
          category_id: p.category_id,
          discription: p.discription,
          active: p.active,
          views: p.views,
          quantity: p.quantity,
          category: p.category,
          type: p.type,
        })),
      };
    })
  );

  return r;
};
