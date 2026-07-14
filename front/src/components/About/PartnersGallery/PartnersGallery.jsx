import React, { useEffect, useRef, useState } from 'react';
import './PartnersGallery.css';

import { SITE_IMAGES } from '../../../constants/siteImages.js';
import Pointer from '../../../assets/Image/Pointer.svg';
import Galochka from '../../../assets/Image/GalochkaPrime.svg';
import { PARTNERS_GALLERY_CARDS } from '../../../constants/brandContent.js';

const images = [
  SITE_IMAGES.boutique,
  SITE_IMAGES.restaurant,
  SITE_IMAGES.corporate,
  SITE_IMAGES.wholesale,
];

const cards = PARTNERS_GALLERY_CARDS.map((card, index) => ({
  ...card,
  image: images[index % images.length],
  direction: index % 2 === 0 ? 'right' : 'left',
}));

const PartnersGallery = () => {
  const [expandedCards, setExpandedCards] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [containerHeight, setContainerHeight] = useState('220vh');
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 767);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const calculateHeight = () => {
      const width = window.innerWidth;

      if (width <= 1024) {
        setContainerHeight('auto');
      } else {
        setContainerHeight('220vh');
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      if (window.innerWidth <= 1024) {
        setScrollProgress(1);
        return;
      }

      const section = sectionRef.current;
      const sectionTop = section.offsetTop;
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const startScroll = sectionTop - windowHeight;
      const animationDistance = windowHeight * 0.4;
      const progress = Math.min(Math.max((scrollY - startScroll) / animationDistance, 0), 1);

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleCard = id => {
    setExpandedCards(prev => (prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]));
  };

  const isCardExpanded = id => expandedCards.includes(id);

  const handleCardClick = (id, event) => {
    if (isMobile && !event.target.closest('.partners-card__cta')) {
      toggleCard(id);
    }
  };

  const handleContactClick = event => {
    event.stopPropagation();
    window.dispatchEvent(new CustomEvent('app:open-contact-modal'));
  };

  return (
    <section className="partners-gallery" ref={sectionRef}>
      <div
        className="partners-gallery__container container"
        style={{
          '--scroll-progress': scrollProgress,
          minHeight: containerHeight,
        }}
      >
        <div className="partners-gallery__scroll-indicator">
          <span className="partners-gallery__scroll-dot" />
          <span className="partners-gallery__scroll-text">листайте вниз</span>
          <img src={Galochka} alt="Листать вниз" />
        </div>

        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`partners-card-wrapper partners-card-wrapper--${index + 1} ${isCardExpanded(card.id) ? 'expanded' : ''}`}
          >
            <div
              className={`partners-card ${isCardExpanded(card.id) ? 'expanded' : ''} ${isCardExpanded(card.id) ? `expanded--${card.direction}` : ''}`}
              onClick={event => handleCardClick(card.id, event)}
              style={{ cursor: isMobile && isCardExpanded(card.id) ? 'pointer' : 'default' }}
            >
              <div className="partners-card__image-wrapper">
                <img src={card.image} alt={card.title} className="partners-card__image" />
              </div>

              {isCardExpanded(card.id) && (
                <div className={`partners-card__expanded-content partners-card__expanded-content--${card.direction}`}>
                  <button
                    className="partners-card__close"
                    onClick={event => {
                      event.stopPropagation();
                      toggleCard(card.id);
                    }}
                  >
                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                      <path d="M3 3L27 27M27 3L3 27" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  <div className="partners-card__content">
                    <h3 className="partners-card__title">{card.title}</h3>
                    <p className="partners-card__question">{card.question}</p>
                    {card.offerLabel && (
                      <div className="partners-card__offer">
                        <div className="partners-card__offer-label">{card.offerLabel}</div>
                        <p className="partners-card__offer-text">{card.offerText}</p>
                      </div>
                    )}
                    <button className="partners-card__cta" onClick={handleContactClick}>
                      Обсудить задачу
                      <img src={Pointer} alt="" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="partners-card__button" onClick={() => toggleCard(card.id)}>
              <span className="partners-card__button-text">{card.title}</span>
              <img
                src={Pointer}
                alt=""
                className={`partners-card__button-arrow ${isCardExpanded(card.id) ? 'rotated' : ''}`}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PartnersGallery;
