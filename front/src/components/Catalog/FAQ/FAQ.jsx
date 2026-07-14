import React, { useState } from 'react';
import './FAQ.css';
import { FAQ_ITEMS } from '../../../constants/brandContent.js';

const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="faq">
      <div className="container">
        <div className="faq__top">
          <h2 className="faq__title">Частые вопросы</h2>
        </div>

        <div className="faq__grid">
          {FAQ_ITEMS.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={`faq-card ${openId === item.id ? 'is-open' : ''} ${index === 0 || index === FAQ_ITEMS.length - 1 ? 'faq-card--wide' : ''}`}
              aria-expanded={openId === item.id}
              onClick={() => setOpenId(current => current === item.id ? null : item.id)}
            >
              <div className="faq-card__inner">
                <div className="faq-card__front">
                  <h3 className="faq-card__question">{item.question}</h3>
                </div>
                <div className="faq-card__back">
                  <p className="faq-card__answer">{item.answer}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
