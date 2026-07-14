import React from 'react';
import Header from '../../components/Home/Header/Header.jsx';
import { Partners } from '../../components/Home/Partners/Partners.jsx';
import { ContactForm } from '../../components/Home/ContactForm/ContactForm.jsx';
import { SeoText } from '../../components/Home/SeoText/SeoText.jsx';
import { Footer } from '../../components/Home/Footer/Footer.jsx';
import { HOME_PARTNER_ITEMS, PARTNER_FEATURED_ITEMS } from '../../constants/brandContent.js';

export const PartnersPage = () => {
  return (
    <>
      <Header />
      <main>
        <div className="partner_container">
          <Partners
            variant="featured-double"
            heroText="Мы работаем с бутиками, ресторанами, корпоративными программами и камерными форматами, где чай становится частью сервиса, ритма пространства и запоминающегося вкусового опыта."
            featuredItems={PARTNER_FEATURED_ITEMS.map(item => ({
              title: item.title,
              content: (
                <div>
                  <strong>Фокус</strong>
                  <span>{item.label}</span>
                </div>
              ),
              targetId: item.targetId,
            }))}
            items={HOME_PARTNER_ITEMS.map(item => ({
              title: item.title,
              targetId: item.partnerId,
              content: (
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.copy}</span>
                </div>
              ),
            }))}
          />
        </div>

        <ContactForm />

        <div>
          <SeoText />
        </div>
      </main>

      <div style={{ backgroundColor: 'var(--color-putty)' }}>
        <Footer />
      </div>
    </>
  );
};
