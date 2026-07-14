import React from 'react';
import './SeoText.css';
import { SITE_IMAGES } from '../../../constants/siteImages.js';

export const SeoText = () => {
  return (
    <section className="SeoText_section">
      <div className="SeoText_container container">
        <div className="SeoText_columns">
          <div className="SeoText_column SeoText_column--image">
            <img src={SITE_IMAGES.collection} alt="Коллекция листового чая" className="SeoText_image" />
          </div>

          <div className="SeoText_column">
            <p className="SeoText_text">
              Сад Тишины создаёт премиальную витрину для редких листовых чаёв, выдержанных
              улунов, белых сортов, матча церемониального класса и подарочных наборов. На
              сайте каждая категория раскрывается как отдельная история: с происхождением,
              вкусовым профилем, рекомендациями по завариванию и поводами для сервировки.
            </p>
            <p className="SeoText_text">
              Такой подход помогает одинаково уверенно работать и с розничным покупателем,
              и с ресторанной командой, и с корпоративным заказом. Витрина поддерживает
              сезонные релизы, редакционные заметки о сортах, подборки под настроение и
              комфортный переход от первого знакомства к оформлению запроса.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
