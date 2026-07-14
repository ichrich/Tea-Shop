const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
    const r = Router();

    r.get(
    '/:id',
    endpoint(async (req) => {
        const { id } = req.params;

        const articleData = await query(`
        SELECT id, title, tag, image, link, blog_id, type, date_published, excerpt, author
        FROM articles
        WHERE id = ?
        `, [id]);

        if (!articleData.length) return null;

        const relatedArticlesData = await query(`
        SELECT id, article_id, title, excerpt, date, image
        FROM related_articles
        WHERE article_id = ?
        `, [id]);

        const articleSectionsData = await query(`
        SELECT id, article_id, title, heading, type, content, image
        FROM article_sections
        WHERE article_id = ?
        `, [id]);

        const article = articleData[0];
        let formattedDate = '';
        if (article.date_published) {
            try {
                let date;
                if (typeof article.date_published === 'string' && article.date_published.match(/^\d{4}-\d{2}-\d{2}/)) {
                    const [year, month, day] = article.date_published.split('-');
                    formattedDate = `${day}.${month}.${year}`;
                } else {
                    date = new Date(article.date_published);
                    if (!isNaN(date.getTime())) {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        formattedDate = `${day}.${month}.${year}`;
                    }
                }
            } catch (e) {
                console.error('Ошибка форматирования даты:', e);
                formattedDate = '';
            }
        }

        return {
            id: article.id,
            title: article.title,
            description: article.excerpt,
            author: article.author,
            date: formattedDate,
            heroImage: imageUrl(article.image || 'blog-7.jpg'),
            sections: articleSectionsData.map(section => {
                let contentArray = [];
                if (section.content) {
                    const lines = section.content.split('\n').filter(line => line.trim());
                    if (lines.length > 0) {
                        contentArray = lines;
                    } else {
                        contentArray = section.content.split('. ').filter(p => p.trim()).map(p => p.trim() + '.');
                    }
                }
                const shortContent = section.content
                    ? section.content.split('. ').slice(0, 3)
                    : [];
                return {
                    id: section.id,
                    title: section.title || '',
                    content: contentArray,
                    shortContent,
                };
            }),
            relatedArticles: relatedArticlesData.map(ra => ({
                id: ra.id,
                title: ra.title,
                excerpt: ra.excerpt,
                date: ra.date,
                image: imageUrl(ra.image || 'default.jpg'),
            }))
        };

    })
    );


    return r;
};
