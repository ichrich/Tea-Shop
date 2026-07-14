const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');
module.exports = (query) => {
   const r = Router();
r.get('/:id', endpoint(async (req) => {
    const { id } = req.params;
    if (!id) {
      return { blog_title: "", articles: [] };
    }
    const rows = await query(`
      SELECT
      a.title,a.tag, a.image, a.link, a.blog_id, a.type, a.date_published, a.excerpt,a.id, ba.title AS blog_title,a.category,a.author
      FROM articles a
      JOIN blog_articles ba ON a.blog_id = ba.id
      WHERE ba.id = ? AND a.date_published IS NOT NULL
      ORDER BY a.date_published DESC, a.id DESC
    `, [id]);
    const articles = rows.map((r) => ({
      id: r.id,
      title: r.title,
      date:r.date_published,
      image: r.image ? imageUrl(r.image) : null,
      tag: r.tag || '',
      link: r.link || '',
      blog_id: r.blog_id,
      excerpt:r.excerpt,
      category:r.category,
      author: r.author || ''
    }));
    return {
      blog_title: rows[0]?.blog_title || "",
      articles,
    };
    }));
    return r;
}
