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

      const now = new Date();
      const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const rows = await query(`
        SELECT
          p.type AS type,
          SUM(oi.quantity) AS total_quantity,
          COALESCE(
            ROUND(SUM(oi.quantity) * 100.0 / NULLIF((SELECT SUM(quantity) FROM order_items WHERE DATE_FORMAT(\`date\`, '%Y-%m')=?), 0), 2),
            0
          ) AS percentage,
          SUM(oi.quantity * oi.price) AS total_Sum,
          DATE_FORMAT(\`date\`, '%Y-%m') AS \`year_month\`
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE  DATE_FORMAT(\`date\`, '%Y-%m')=?
        GROUP BY p.type,\`year_month\`
        ORDER BY \`year_month\` DESC
      `, [currentYM,currentYM]);

      const items = rows.map((r) => ({
        type: r.type,
        totalQuantity: r.total_quantity,
        percentage: rows.length==1?100:Number(r.percentage),
        total_Sum: Number(r.total_Sum),
        currentMonthQuantity: Number(r.current_month_quantity || 0),
      }));

      return { items };
    })
  );
  return r;
};