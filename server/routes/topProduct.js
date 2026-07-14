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
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const currentMonth = `${year}-${month}`;
      await query(`SET @old_sql_mode = @@SESSION.sql_mode;`);
      await query(`SET SESSION sql_mode = '';`);
      const rows = await query(
        `
SELECT
  p.id,
  MAX(p.name) AS name,
  MAX(p.count) AS count,
  MAX(p.price) AS price,
  MAX(p.category) AS usefull,
  MAX(p.type) AS type,
  MAX(p.image) AS image,
  MAX(t.year_month) AS \`year_month\`,
  MAX(p.active) AS active,
  IFNULL(t.total_quantity, 0) AS total_quantity,
  IFNULL(v.views_count, 0) AS views_count,
  IFNULL(t.total_revenue, 0) AS total_revenue
FROM products p
LEFT JOIN (
  SELECT
    oi.product_id,
    DATE_FORMAT(oi.date, '%Y-%m') AS \`year_month\`,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.quantity * oi.price) AS total_revenue
  FROM order_items oi
  WHERE DATE_FORMAT(oi.date, '%Y-%m') = ?
  GROUP BY oi.product_id
) t ON t.product_id = p.id
LEFT JOIN (
  SELECT product_id, COUNT(*) AS views_count
  FROM views_date
  GROUP BY product_id
) v ON v.product_id = p.id
WHERE p.category_id = 3
GROUP BY p.id
ORDER BY total_revenue DESC
LIMIT 10;
        `,
        [currentMonth]
      );
      await query(`SET SESSION sql_mode = @old_sql_mode;`);
      const allProducts = rows.map((r) => ({
        id: r.id,
        productId: r.id,
        name: r.name,
        category: r.type,
        views: r.views_count || 0,
        price: r.price,
        quantity: r.count,
        active: Boolean(r.active),
        date: r.dateGHJ || currentMonth,
        status: r.count > 0 ? 'in_stock' : 'out_of_stock',
        image: imageUrl(r.image) || null,
        total_revenue: r.total_revenue,
        usefull: r.useful,
        total_quantity: r.total_quantity
      }));
      return allProducts;
    })
  );

  return r;
};
