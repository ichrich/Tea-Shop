import React from 'react';
import { Button } from '../Button/Button.jsx';
import './Hero.css';
import { SITE_BRAND, TEA_PRODUCTS } from '../../../constants/siteBrand.js';
import { SITE_IMAGES } from '../../../constants/siteImages.js';

const hero = {
  eyebrow: 'Премиальный чайный дом',
  title: SITE_BRAND.name,
  subtitle: SITE_BRAND.tagline,
  note:
    'Витрина собрана как спокойная премиальная подача: коллекция, сценарии покупки, подарочные линии и понятный маршрут к заявке без лишнего шума.',
  stats: ['20+ сортов в постоянной коллекции', 'Частные подборы', 'Розница, HoReCa, подарки'],
  products: TEA_PRODUCTS.slice(0, 4),
};

export const Hero = () => {
  return (
    <section className="Hero_section">
      <div className="Hero_backdrop" style={{ backgroundImage: `url(${SITE_IMAGES.home})` }} />

      <div className="Hero_content container">
        <div className="Hero_copy">
          <p className="Hero_eyebrow">{hero.eyebrow}</p>
          <h1 className="Hero_title">{hero.title}</h1>
          <p className="Hero_subtitle">{hero.subtitle}</p>
          <p className="Hero_note">{hero.note}</p>

          <div className="Hero_stats">
            {hero.stats.map(item => (
              <span key={item}>{item}</span>
            ))}
          </div>

          <div className="Hero_buttons">
            <Button variant="primary" onClick={() => (window.location.href = '/tea')}>
              {SITE_BRAND.catalogCta}
            </Button>
            <Button variant="outline" onClick={() => window.dispatchEvent(new Event('app:open-contact-modal'))}>
              {SITE_BRAND.contactCta}
            </Button>
          </div>
        </div>

        <div className="Hero_panel">
          <div className="Hero_panel_head">
            <span>Сейчас в фокусе</span>
            <span>Отобранный релиз</span>
          </div>

          <div className="Hero_panel_grid">
            {hero.products.map(product => (
              <article className="Hero_product" key={product.id}>
                <span className="Hero_product_name">{product.name}</span>
                <strong className="Hero_product_title">{product.fullName}</strong>
                <span className="Hero_product_price">{product.price}</span>
              </article>
            ))}
          </div>

          <div className="Hero_panel_footer">
            <span>Сезонные программы для розницы, гастрономии и подарочных линий.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
