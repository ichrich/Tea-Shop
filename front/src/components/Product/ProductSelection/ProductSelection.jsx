import React from 'react';
import './ProductSelection.css';
import Pointer from '../../../assets/Image/Pointer.svg';
import { SITE_IMAGES } from '../../../constants/siteImages.js';

const products = [
  { id: 1, name: 'Сенча Кагосима', price: '2 400 ₽', image: SITE_IMAGES.sencha, href: '/tea/sencha' },
  { id: 2, name: 'Да Хун Пао', price: '2 800 ₽', image: SITE_IMAGES.daHongPao, href: '/catalog/all?tonicType=%D0%A3%D0%BB%D1%83%D0%BD' },
];

export const ProductSelection = () => {
  return (
    <section className="ProductSelection">
      <div className="ProductSelection_inner container">
        <div className="ProductSelection_header">
          <h2 className="ProductSelection_title">Дополнить подбор</h2>
          <a href="/catalog/all" className="ProductSelection_link">
            Смотреть ещё
            <img src={Pointer} alt="" />
          </a>
        </div>

        <div className="ProductSelection_grid">
          {products.map(product => (
            <a key={product.id} href={product.href} className="ProductSelection_card">
              <div className="ProductSelection_card_image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="ProductSelection_card_info">
                <p className="ProductSelection_card_name">{product.name}</p>
                <p className="ProductSelection_card_price">{product.price}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
