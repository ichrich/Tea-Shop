import React from 'react';
import './ProductAction.css';
import { SITE_IMAGES } from '../../../constants/siteImages.js';
import { motion as Motion } from 'framer-motion';

const image = SITE_IMAGES.teaware;

export const ProductAction = () => {
  return (
    <section className="ProductAction">
      <Motion.div
        className="ProductAction_inner container"
        initial={{ opacity: 0.45, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="ProductAction_left">
          <h2 className="ProductAction_title">
            Чай в коллекции
            <br />
            подаётся как предмет внимания,
            а не как случайная позиция.
          </h2>
        </div>

        <div className="ProductAction_model">
          <img src={image} alt="Чайная подача" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <div className="ProductAction_right">
          <ul className="ProductAction_list">
            <li className="ProductAction_list_item">Раскрывает происхождение, характер листа и вкусовой профиль.</li>
            <li className="ProductAction_list_item">Даёт понятные рекомендации по воде, температуре и времени настаивания.</li>
            <li className="ProductAction_list_item">Органично работает в рознице, подарочной линии и ресторанной подаче.</li>
            <li className="ProductAction_list_item">Подходит для сезонных релизов, флагманских страниц и редакционных заметок.</li>
          </ul>
        </div>
      </Motion.div>
    </section>
  );
};
