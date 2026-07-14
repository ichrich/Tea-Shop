const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
  const r = Router();
  r.use(authenticateToken);
r.get(
    '/',
    endpoint(async () => {
      const now = new Date();
      const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
      const previousYM = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      try {
        const [orders, views] = await Promise.all([
          query(
            `
            SELECT DATE_FORMAT(\`date\`, '%Y-%m') AS \`year_month\`,
                   SUM(\`quantity\`) AS \`total_quantity\`,
                   SUM(\`price\` * \`quantity\`) AS \`total_revenue\`
            FROM \`order_items\`
            WHERE DATE_FORMAT(\`date\`, '%Y-%m') IN (?, ?)
            GROUP BY \`year_month\`
            ORDER BY \`year_month\`
            `,
            [currentYM, previousYM]
          ),
          query(
            `
            SELECT DATE_FORMAT(\`date\`, '%Y-%m') AS \`year_month\`,
                   COUNT(\`id\`) AS \`total_views\`
            FROM \`views_date\`
            WHERE DATE_FORMAT(\`date\`, '%Y-%m') IN (?, ?)
            GROUP BY \`year_month\`
            ORDER BY \`year_month\`
            `,
            [currentYM, previousYM]
          ),
        ]);
        const dataMap = {};
        orders.forEach((r) => {
          dataMap[r.year_month] = {
            total_quantity: Number(r.total_quantity || 0),
            total_revenue: Number(r.total_revenue || 0),
            total_views: 0,
          };
        });
        views.forEach((r) => {
          dataMap[r.year_month] = dataMap[r.year_month] || {
            total_quantity: 0,
            total_revenue: 0,
            total_views: 0,
          };
          dataMap[r.year_month].total_views = Number(r.total_views || 0);
        });
        const currentData = dataMap[currentYM] || { total_quantity: 0, total_revenue: 0, total_views: 0 };
        const previousData = dataMap[previousYM] || { total_quantity: 0, total_revenue: 0, total_views: 0 };
        const calcPct = (cur, prev) => {
          if (prev === 0) return null;
          return ((cur - prev) / prev) * 100;
        };
        const payload = {
          currentMonth: currentYM,
          previousMonth: previousYM,
          current: {
            totalQuantity: currentData.total_quantity,
            totalRevenue: currentData.total_revenue,
            totalViews: currentData.total_views,
          },
          previous: {
            totalQuantity: previousData.total_quantity,
            totalRevenue: previousData.total_revenue,
            totalViews: previousData.total_views,
          },
          changes: {
            quantityPct: calcPct(currentData.total_quantity, previousData.total_quantity),
            revenuePct: calcPct(currentData.total_revenue, previousData.total_revenue),
            viewsPct: calcPct(currentData.total_views, previousData.total_views),
          },
        };
        return payload;
      } catch (error) {
        console.error('Ошибка при обработке метрик:', error);
        return { message: 'Произошла ошибка при обработке данных' }, 500;
      }
    })
  );
  return r;
};