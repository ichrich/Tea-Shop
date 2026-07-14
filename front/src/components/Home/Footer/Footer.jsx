import React from 'react';
import './Footer.css';
import { SITE_BRAND } from '../../../constants/siteBrand.js';
import { BRAND_NAV } from '../../../constants/brandContent.js';

export const Footer = () => {
  const footerColumns = [
    { title: 'Каталог', links: BRAND_NAV.catalog },
    { title: 'Коллекция', links: BRAND_NAV.tea },
    { title: 'Информация', links: BRAND_NAV.info.slice(0, 3) },
  ];

  return (
    <footer className="Footer">
      <div className="Footer_container container">
        <div className="Footer_main">
          <div className="Footer_intro">
            <span className="Footer_badge">Премиальный чайный дом</span>
            <h2 className="Footer_title">{SITE_BRAND.name}</h2>
            <p className="Footer_text">
              Премиальная коллекция листового чая, редких купажей и подарочных наборов,
              собранная для спокойной ежедневной церемонии и профессиональной сервировки.
            </p>
          </div>

          {footerColumns.map(column => (
            <div key={column.title} className="Footer_column">
              <h3 className="Footer_column_title">{column.title}</h3>
              <div className="Footer_column_list">
                {column.links.map(link => (
                  <a key={link.href} href={link.href}>
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="Footer_bottom">
          <p className="Footer_meta">{SITE_BRAND.tagline}</p>
          <a href="/tea" className="Footer_bottom_link">
            Открыть чайную коллекцию
          </a>
        </div>
      </div>
    </footer>
  );
};
