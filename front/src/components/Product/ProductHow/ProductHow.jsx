import React from 'react';
import './ProductHow.css';
import { SITE_IMAGES } from '../../../constants/siteImages.js';

const image = SITE_IMAGES.brewing;

export const ProductHow = () => {
  return (
    <section className="ProductHow">
      <div className="ProductHow_inner container">
        <div className="ProductHow_left ProductHow_desktop">
          <h2 className="ProductHow_title">Как заваривать?</h2>
        </div>

        <div className="ProductHow_model ProductHow_desktop">
          <img src={image} alt="Чай" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="ProductHow_right ProductHow_desktop">
          <p className="ProductHow_text">
            Для сенчи лучше использовать мягкую воду температурой 70-75 °C. На 4 грамма чая
            достаточно 120-150 мл воды и 45-60 секунд первого настаивания.
          </p>
          <p className="ProductHow_text">
            Второй и третий проливы раскрывают больше сладости и зелёной глубины. Такой режим
            оставляет вкус собранным и бережно показывает текстуру листа.
          </p>
        </div>

        <div className="ProductHow_adaptive">
          <div className="ProductHow_adaptive_model">
            <img src={image} alt="Чай" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div className="ProductHow_adaptive_content">
            <h2 className="ProductHow_title">Как заваривать?</h2>
            <div className="ProductHow_content">
              <p className="ProductHow_text">
                Мягкая вода, 70-75 °C, короткие проливы и небольшое количество листа.
              </p>
              <p className="ProductHow_text">
                Так чай раскрывает свежесть, сладость и чистое послевкусие без лишней горечи.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
