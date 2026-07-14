import React from 'react';
import './Catalog.css';
import Pointer from '../../../assets/Image/Pointer.svg';
import GreyPointer from '../../../assets/Image/GreyPointer.svg';
import { SITE_IMAGES } from '../../../constants/siteImages.js';
import { getCatalogTileLink } from '../../../constants/catalogTonicLinks.js';

export const Catalog = () => {
  const categories = [
    {
      id: 1,
      name: 'Да Хун Пао',
      image: SITE_IMAGES.daHongPao,
      link: null,
      size: 'small',
    },
    {
      id: 2,
      name: 'Матча Удзи',
      image: SITE_IMAGES.matcha,
      link: null,
      size: 'small',
    },
    {
      id: 3,
      name: 'Белый пион',
      image: SITE_IMAGES.whiteTea,
      link: null,
      size: 'large',
    },
    {
      id: 4,
      name: 'Сенча\nКагосима',
      image: SITE_IMAGES.sencha,
      link: null,
      size: 'large',
    },
  ];

  return (
    <section className="Catalog_section container">
      <div className="Catalog_header">
        <h2 className="Catalog_title">Каталог</h2>
        <a href="/catalog" className="Catalog_link_all">
          Все чаи
          <img src={Pointer} alt="" />
        </a>
      </div>

      <div className="Catalog_grid">
        {categories.map(category => (
          <a
            key={category.id}
            href={category.link ?? getCatalogTileLink(category.name)}
            className={`Catalog_card Catalog_card--${category.size}`}
          >
            <div className="Catalog_card_image">
              <img src={category.image} alt={category.name} />
            </div>

            <div className="Catalog_card_content">
              <div className="Catalog_card_link">
                <span>Открыть раздел</span>
                <img src={GreyPointer} alt="" />
              </div>

              <h3 className="Catalog_card_title">{category.name}</h3>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
