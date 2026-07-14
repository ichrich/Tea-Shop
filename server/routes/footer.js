const { Router } = require('express');
const { endpoint } = require('../utils/endpoint');
const { imageUrl } = require('../utils/image');

function buildFooterBySection(sections, links) {
  const bySection = {};
  sections.forEach((s) => {
    bySection[s.id] = { id: s.id, title: s.title, links: [] };
  });
  links.forEach((l) => {
    const sec = bySection[l.tonics_section_id];
    if (sec) sec.links.push({ text: l.text, href: l.href });
  });
  return bySection;
}
module.exports = (query) => {
   const r = Router();
r.get(
    '/',
    endpoint(async (req) => {
      const sections = await query('SELECT id, title FROM tonics_section');
      const links = await query('SELECT tonics_section_id, text, href FROM tonics_links');
      const bySection = buildFooterBySection(sections, links);
      const tonicsSection = sections.find((s) => s.title === 'Наши тоники');
      const catalogSection = sections.find((s) => s.title === 'Каталог');
      const aboutSection = sections.find((s) => s.title === 'О компании');
      return {
        tonics: {
          title: tonicsSection?.title ?? 'Наши тоники',
          links: bySection[tonicsSection?.id]?.links ?? [],
        },
        catalog: {
          title: catalogSection?.title ?? 'Каталог',
          links: bySection[catalogSection?.id]?.links ?? [],
        },
        about: {
          title: aboutSection?.title ?? 'О компании',
          links: bySection[aboutSection?.id]?.links ?? [],
        },
      };
    })
    );
    return r;
}