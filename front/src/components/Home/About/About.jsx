import React from 'react';
import './About.css';
import Pointer from '../../../assets/Image/Pointer.svg';
import { SITE_IMAGES } from '../../../constants/siteImages.js';

export const About = () => {
  return (
    <section className="About_section section-dark container">
      <picture className="About_picture">
        <img src={SITE_IMAGES.plantation} alt="Чайная плантация" className="About_image" />
      </picture>

      <div className="About_content">
        <div className="About_left_column">
          <h2 className="About_title">О бренде</h2>
          <p className="About_text">
            Сад Тишины собирает чай как коллекцию настроений: от ясной утренней сенчи и
            сливочных улунов до белых сортов для вечерней паузы и подарочных коробок для
            камерных событий.
          </p>
          <p className="About_text">
            Нам важны происхождение листа, чистота аромата и спокойная подача без лишнего
            шума. Поэтому сайт работает как редакционная витрина: помогает не просто выбрать
            чай, а почувствовать его характер до первого заваривания.
          </p>
        </div>
      </div>

      <a href="/about" className="About_button">
        Читать историю бренда
        <img src={Pointer} alt="" />
      </a>
    </section>
  );
};
