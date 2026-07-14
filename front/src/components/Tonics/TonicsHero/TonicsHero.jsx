import React from 'react';
import './TonicsHero.css';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs.jsx';

const TonicsHero = () => {
  return (
    <div className="TonicsHero_wrapper">
      <div className="TonicsHero_breadcrumbs container">
        <Breadcrumbs />
      </div>

      <div className="TonicsHero_title_wrap container">
        <h1 className="TonicsHero_title left">Чайная</h1>
        <h1 className="TonicsHero_title right">коллекция</h1>
      </div>

      <div className="TonicsHero_desc_center">
        <p className="TonicsHero_description TonicsHero_desc_center_short">
          Сезонные чаи, редкие сорта,
          <br />
          подарочные подборки и сервировочные истории
        </p>

        <p className="TonicsHero_description TonicsHero_desc_center_long">
          Мы собираем ассортимент так, чтобы каждый раздел читался как отдельный жест:
          бодрое утро, спокойный вечер, камерный подарок, ресторанная подача или чайная
          церемония для дома.
        </p>
      </div>
    </div>
  );
};

export default TonicsHero;
