const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

module.exports = (query) => {
   const r = Router();
   r.get(
    '/',
    endpoint(async () => {
      const rows = await query(`
        SELECT
          id, slug, title, description, placeholder_name, placeholder_email,
          placeholder_message, checkbox_label, button_text, created_at, updated_at, status
        FROM cms_pages
      `);
      const pages = Array.isArray(rows)
        ? rows.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            description: p.description,
            placeholder_name: p.placeholder_name,
            placeholder_email: p.placeholder_email,
            placeholder_message: p.placeholder_message,
            checkbox_label: p.checkbox_label,
            button_text: p.button_text,
            created_at: p.created_at,
            updated_at: p.updated_at,
            status: p.status,
          }))
        : [];
      return { pages };
    })
    );
    return r;
}
