const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
    const r = Router();
    r.use(authenticateToken);
r.post(
        '/create',
        endpoint(async (req) => {
            const { articleId, title, content } = req.body;

            if (!articleId) {
                throw new Error('Missing articleId');
            }

            const result = await query(
                `
                INSERT INTO article_sections (article_id, title, content, type)
                VALUES (?, ?, ?, 'text')
                `,
                [articleId, title || '', content || '']
            );

            return { ok: true, id: result.insertId };
        })
    );
    r.post(
        '/update',
        endpoint(async (req) => {
            const { id, title, content } = req.body;

            if (!id) {
                throw new Error('Missing id');
            }

            await query(
                `
                UPDATE article_sections
                SET title = ?, content = ?
                WHERE id = ?
                `,
                [title || '', content || '', id]
            );

            return { ok: true, id };
        })
    );
r.post(
        '/delete',
        endpoint(async (req) => {
            const { id } = req.body;

            if (!id) {
                throw new Error('Missing id');
            }

            await query(`DELETE FROM article_sections WHERE id = ?`, [id]);

            return { ok: true };
        })
    );
r.get(
        '/:articleId',
        endpoint(async (req) => {
            const { articleId } = req.params;
            const rows = await query(
                `
                SELECT id, article_id, title, heading, type, content, image
                FROM article_sections
                WHERE article_id = ?
                ORDER BY id ASC
                `,
                [articleId]
            );
            return rows.map((row) => ({
                id: row.id,
                articleId: row.article_id,
                title: row.title || '',
                heading: row.heading || '',
                type: row.type || 'text',
                content: row.content || '',
                image: row.image || null,
            }));
        })
    );

    return r;
};
