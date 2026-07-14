const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
module.exports = (query) => {
    const r = Router();
r.get(
        '/categories',
        endpoint(async (req) => {
            const categoryCounts = await query(`
                SELECT
                    COUNT(p.id) AS count,
                    p.type AS name
                FROM products p
                WHERE p.type IS NOT NULL
                  AND TRIM(p.type) <> ''
                GROUP BY p.type
                ORDER BY count DESC;
            `);

            return categoryCounts.map(cat => ({name: cat.name, count: cat.count}));
        })
    );

    return r;
};
