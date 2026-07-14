import React from 'react';
import './ProductHero.css';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs.jsx';
import { SITE_IMAGES } from '../../../constants/siteImages.js';

const heroImage = SITE_IMAGES.sencha;

export const ProductHero = ({
  title = 'Сенча Кагосима',
  subtitle = 'Ясный зелёный чай с морской свежестью, мягкой сладостью и длинным чистым послевкусием.',
}) => {
  return (
    <div
      className="ProductHero_wrapper"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="ProductHero_breadcrumbs container">
        <Breadcrumbs />
      </div>

      <div className="ProductHero_title_wrap">
        <h1 className="ProductHero_title">{title}</h1>
      </div>

      <div className="ProductHero_desc_wrap container">
        <p className="ProductHero_subtitle">{subtitle}</p>
      </div>
    </div>
  );
};
