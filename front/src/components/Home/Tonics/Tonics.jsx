import React from 'react';
import './Tonics.css';
import { SITE_IMAGES } from '../../../constants/siteImages.js';
import Pointer from '../../../assets/Image/Pointer.svg';

const items = [
  { name: 'СЕНЧА', image: SITE_IMAGES.sencha, className: 'Tonics_word_sencha', href: '/catalog/all?tonicType=%D0%A1%D0%B5%D0%BD%D1%87%D0%B0' },
  { name: 'УЛУН', image: SITE_IMAGES.daHongPao, className: 'Tonics_word_fucus', href: '/catalog/all?tonicType=%D0%A3%D0%BB%D1%83%D0%BD' },
  { name: 'БЕЛЫЙ', image: SITE_IMAGES.whiteTea, className: 'Tonics_word_corbicula', href: '/catalog/all?tonicType=%D0%91%D0%B5%D0%BB%D1%8B%D0%B9+%D1%87%D0%B0%D0%B9' },
  { name: 'МАТЧА', image: SITE_IMAGES.matcha, className: 'Tonics_word_laminaria', href: '/catalog/all?tonicType=%D0%9C%D0%B0%D1%82%D1%87%D0%B0' },
  { name: 'ПУЭР', image: SITE_IMAGES.puer, className: 'Tonics_word_zostera', href: '/catalog/all?tonicType=%D0%9F%D1%83%D1%8D%D1%80' },
];

export const Tonics = ({ showAllLink = true }) => {
  return (
    <section className="Tonics_section container">
      <div className="Tonics_header">
        <h2 className="Tonics_title">ЧАЙНАЯ КОЛЛЕКЦИЯ</h2>
        {showAllLink && (
          <a href="/catalog/all" className="Tonics_link_all">
            Вся коллекция
            <img src={Pointer} alt="" />
          </a>
        )}
      </div>

      <div className="Tonics_visual">
        {items.map(item => (
          <a key={item.name} href={item.href} className={`Tonics_word ${item.className}`}>
            <span>{item.name}</span>
            <img src={item.image} alt={item.name} className="Tonics_img" />
          </a>
        ))}
      </div>
    </section>
  );
};
