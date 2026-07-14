import React from 'react';
import './BlogSection.css';
import { SITE_IMAGES } from '../../../constants/siteImages.js';
import Pointer from '../../../assets/Image/Pointer.svg';

export const BlogSection = () => {
  const articles = [
    {
      id: 1,
      type: 'large',
      image: SITE_IMAGES.storage,
      date: '10 июля 2025',
      title: 'Как выбрать чай для спокойного вечернего ритуала',
      excerpt:
        'Белые сорта, округлые улуны и выдержанные позиции раскрываются по-разному в чашке. В материале собраны ориентиры, которые помогают выбрать чай под настроение, а не по случайному названию.',
    },
    {
      id: 2,
      type: 'medium',
      image: SITE_IMAGES.tasting,
      date: '15 июля 2025',
      title: 'Почему сезонный урожай меняет подачу коллекции',
      excerpt:
        'Свежий лист влияет на структуру каталога, тон фотографий и формат презентации. Показываем, как вводить новые релизы аккуратно и без ощущения распродажи.',
    },
    {
      id: 3,
      type: 'medium',
      image: SITE_IMAGES.gifts,
      date: '16 июля 2025',
      title: 'Сервировка чая для бутика, ресторана и подарочной линии',
      excerpt:
        'Один и тот же сорт может звучать камерно в витрине, гастрономично в чайной карте и празднично в подарочном наборе. Разбираем, какие детали реально меняют впечатление.',
    },
  ];

  return (
    <section className="BlogSection">
      <div className="BlogSection_container container">
        <div className="BlogSection_header">
          <h2 className="BlogSection_title BlogSection_title--desktop">Читать подробнее</h2>
          <h2 className="BlogSection_title BlogSection_title--mobile">Подробнее</h2>

          <a href="/blog" className="BlogSection_link">
            Все статьи
            <img src={Pointer} alt="" />
          </a>
        </div>

        <div className="BlogSection_grid">
          {articles.map(article => (
            <a href={`/blog/${article.id}`} key={article.id} className={`BlogSection_card BlogSection_card--${article.type}`}>
              <div className="BlogSection_card_image">
                <img src={article.image} alt={article.title} />
              </div>
              <div className="BlogSection_card_content">
                <time className="BlogSection_card_date">{article.date}</time>
                <h3 className="BlogSection_card_title">{article.title}</h3>
                <p className="BlogSection_card_excerpt">{article.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
