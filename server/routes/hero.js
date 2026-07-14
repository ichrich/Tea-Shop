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
          title_left AS "titleLeft",
          title_right AS "titleRight",
          subtitle AS "subtitle",
          image_alt AS "imageAlt",
          button1_text AS "button1Text",
          button1_primary AS "button1Primary",
          button2_text AS "button2Text",
          button2_primary AS "button2Primary"
        FROM hero_section
        LIMIT 1
      `);
      const r = rows[0] || {};
      return {
        titleLeft: r.titleLeft,
        titleRight: r.titleRight,
        subtitle: r.subtitle,
        imageAlt: imageUrl(r.imageAlt),
        buttons: [
          { text: r.button1Text, primary: !!r.button1Primary },
          { text: r.button2Text, primary: !!r.button2Primary },
        ],
      };
    })
    );
    return r;
}
