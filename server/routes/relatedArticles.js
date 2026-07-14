const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { authenticateToken } = require('../middleware/auth');
module.exports = (query) => {
  const r = Router();
  r.use(authenticateToken);
r.get(
    '/:articleId',
    endpoint(async (req) => {
      const { articleId } = req.params;
      const rows = await query(
        `
        SELECT id, article_id, title, excerpt, date, image, category
        FROM related_articles
        WHERE article_id = ?
        ORDER BY id ASC
        `,
        [articleId]
      );
      const articlesMap = new Map();
      const allArticles = await query(`SELECT id, title FROM articles WHERE blog_id = 1`);
      allArticles.forEach(a => articlesMap.set(a.title, a.id));

      return rows.map((row) => ({
        id: row.id,
        articleId: row.article_id,
        relatedArticleId: articlesMap.get(row.title) || null, // пытаемся найти ID по названию
        title: row.title,
        excerpt: row.excerpt,
        date: row.date,
        image: row.image,
        category: row.category,
      }));
    })
  );
r.post(
    '/create',
    endpoint(async (req) => {
      const { articleId, relatedArticleId } = req.body;

      if (!articleId || !relatedArticleId) {
        throw new Error('Missing articleId or relatedArticleId');
      }
      const relatedArticle = await query(
        `
        SELECT title, excerpt, date_published, image
        FROM articles
        WHERE id = ?
        `,
        [relatedArticleId]
      );

      if (!relatedArticle.length) {
        throw new Error('Related article not found');
      }

      const article = relatedArticle[0];
      const relatedArticleWithCategory = await query(
        `
        SELECT category FROM articles WHERE id = ?
        `,
        [relatedArticleId]
      );

      const result = await query(
        `
        INSERT INTO related_articles (article_id, title, excerpt, date, image, category)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          articleId,
          article.title,
          article.excerpt || '',
          article.date_published || null,
          article.image || null,
          relatedArticleWithCategory[0]?.category || null,
        ]
      );

      return { ok: true, id: result.insertId };
    })
  );
r.post(
    '/delete',
    endpoint(async (req) => {
      const { id } = req.body;

      if (!id) {
        throw new Error('Missing id');
      }

      await query(`DELETE FROM related_articles WHERE id = ?`, [id]);

      return { ok: true };
    })
  );

  return r;
};
