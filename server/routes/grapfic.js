const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
  const r = Router();
  r.use(authenticateToken);
r.get(
    '/',
    endpoint(async () => {
      const [viewsRows, ordersRows] = await Promise.all([
        query(
          `
          SELECT DATE_FORMAT(views_date.date, '%Y-%m') AS \`year_month\`,
                 COUNT(views_date.id) AS total_views
          FROM views_date
          GROUP BY \`year_month\`
          ORDER BY \`year_month\`
          `,
          []
        ),
        query(
          `
          SELECT DATE_FORMAT(order_items.date, '%Y-%m') AS \`year_month\`,
                 SUM(order_items.quantity) AS total_quantity
          FROM order_items
          GROUP BY \`year_month\`
          ORDER BY \`year_month\`
          `,
          []
        ),
      ]);
      const map = new Map();
      viewsRows.forEach((r) => {
        map.set(r.year_month, {
          year_month: r.year_month,
          total_views: Number(r.total_views || 0),
          total_quantity: 0,
        });
      });
      ordersRows.forEach((r) => {
        const existing = map.get(r.year_month) || {
          year_month: r.year_month,
          total_views: 0,
          total_quantity: 0,
        };
        existing.total_quantity = Number(r.total_quantity || 0);
        map.set(r.year_month, existing);
      });
      const data = Array.from(map.values()).sort((a, b) =>
        a.year_month.localeCompare(b.year_month)
      );
      return { data };
    })
  );
  return r;
};
