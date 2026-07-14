import React from 'react';
import './ProductInfo.css';
import { SITE_IMAGES } from '../../../constants/siteImages.js';

const image = SITE_IMAGES.harvest;

export const ProductInfo = () => {
  return (
    <section className="ProductInfo">
      <div className="ProductInfo_inner container">
        <div className="ProductInfo_left ProductInfo_desktop">
          <h2 className="ProductInfo_title">Что это за чай?</h2>
        </div>

        <div className="ProductInfo_model ProductInfo_desktop">
          <img src={image} alt="Сенча Кагосима" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="ProductInfo_right ProductInfo_desktop">
          <p className="ProductInfo_text">
            Сенча Кагосима собирается ранней весной и даёт чистую, светлую чашку с нотой
            молодой зелени, рисовой сладости и прохладной морской минерализации.
          </p>
          <p className="ProductInfo_text">
            Это чай для утреннего ритуала и внимательной сервировки: он хорошо раскрывается
            при мягкой воде и коротких проливах, оставаясь прозрачным, собранным и очень живым.
          </p>
        </div>

        <div className="ProductInfo_adaptive">
          <div className="ProductInfo_adaptive_model">
            <img src={image} alt="Сенча Кагосима" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div className="ProductInfo_adaptive_content">
            <h2 className="ProductInfo_title">Что это за чай?</h2>
            <div className="ProductInfo_content">
              <p className="ProductInfo_text">
                Весенний японский зелёный чай с чистым ароматом, мягкой сладостью и
                свежим травяным послевкусием.
              </p>
              <p className="ProductInfo_text">
                Подходит для утренней чашки, спокойной дневной паузы и деликатной
                гастрономической подачи.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
