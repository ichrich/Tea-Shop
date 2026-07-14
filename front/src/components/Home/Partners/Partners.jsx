import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Partners.css';
import Pointer from '../../../assets/Image/Pointer.svg';
import Breadcrumbs from '../../Breadcrumbs/Breadcrumbs.jsx';

export const Partners = ({
  variant = 'default',
  title = 'Партнёрские направления',
  titleShort = 'Партнёры',
  showAllLink = true,
  featuredItems = [],
  heroText = null,
  items = [],
}) => {
  const navigate = useNavigate();

  const openPartner = targetId => {
    navigate(`/partners/${targetId}`);
  };

  const handleCardClick = (partner, index) => {
    openPartner(partner.targetId || index + 1);
  };

  const handleFeaturedClick = featuredIndex => {
    const targetId = featuredItems[featuredIndex]?.targetId || featuredIndex + 1;
    openPartner(targetId);
  };

  const renderFeatured = (item, index, modifier) => {
    if (!item) return null;

    return (
      <div
        className={`Partners_featured Partners_featured--${modifier}`}
        onClick={() => handleFeaturedClick(index)}
        role="button"
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleFeaturedClick(index);
          }
        }}
      >
        <div className="Partners_featured_header">
          <h3 className="Partners_featured_title">{item.title}</h3>
        </div>
        <div className="Partners_featured_content">
          {item.content || (
            <div>
              <strong>Формат</strong>
              <span>{item.label || item.title}</span>
            </div>
          )}
        </div>
        <a
          href={item.link || `/partners/${item.targetId || index + 1}`}
          className="Partners_featured_link"
          onClick={event => {
            event.stopPropagation();
          }}
        >
          Подробнее
          <img src={Pointer} alt="" />
        </a>
      </div>
    );
  };

  return (
    <section className={`Partners_section Partners_section--${variant}`}>
      <div className="Partners_container container">
        <Breadcrumbs />

        {heroText ? (
          <h1 className="Partners_hero_text">{heroText}</h1>
        ) : (
          <div className="Partners_header">
            <h2 className="Partners_title">
              <span className="Partners_title_full">{title}</span>
              <span className="Partners_title_short">{titleShort}</span>
            </h2>
            {showAllLink && (
              <a href="/partners" className="Partners_link">
                Все направления
                <img src={Pointer} alt="" />
              </a>
            )}
          </div>
        )}

        <div className={`Partners_grid Partners_grid--${variant}`}>
          {variant === 'featured-double' && renderFeatured(featuredItems[0], 0, 1)}

          {items.map((partner, index) => (
            <div
              key={partner.targetId || index}
              className="Partners_card"
              onClick={() => handleCardClick(partner, index)}
              role="button"
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleCardClick(partner, index);
                }
              }}
            >
              <div className="Partners_card_title">{partner.title}</div>

              {partner.content ? (
                <div className="Partners_card_content">{partner.content}</div>
              ) : (
                <div className="Partners_card_placeholder">
                  На странице направления собраны формат поставки, сценарии сервировки, сезонные акценты и рекомендуемый ассортимент.
                </div>
              )}

              <a
                href={partner.link || `/partners/${partner.targetId || index + 1}`}
                className="Partners_card_link"
                onClick={event => {
                  event.stopPropagation();
                }}
              >
                Подробнее
                <img src={Pointer} alt="" />
              </a>
            </div>
          ))}

          {variant === 'featured-double' && renderFeatured(featuredItems[1], 1, 2)}
        </div>
      </div>
    </section>
  );
};
