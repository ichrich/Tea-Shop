import React, { useLayoutEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/Home/Header/Header.jsx';
import { ContactForm } from '../../components/Home/ContactForm/ContactForm.jsx';
import { Footer } from '../../components/Home/Footer/Footer.jsx';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs.jsx';
import { partnersData } from '../../data/partnersData.js';
import { PARTNER_STATS } from '../../constants/brandContent.js';
import './PartnerDetailPage.css';

export const PartnerDetailPage = () => {
  const { id } = useParams();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    requestAnimationFrame(() => requestAnimationFrame(scrollToTop));
    const timeoutId = window.setTimeout(scrollToTop, 50);

    return () => {
      window.clearTimeout(timeoutId);
      window.history.scrollRestoration = previousRestoration || 'auto';
    };
  }, [id]);

  const partner = useMemo(() => {
    const numericId = Number(id);
    if (Number.isFinite(numericId) && numericId > 0) {
      return partnersData.find(item => item.id === numericId) || partnersData[0];
    }
    return partnersData[0];
  }, [id]);

  const stats = partner.stats?.length ? partner.stats : PARTNER_STATS;

  return (
    <>
      <Header />

      <main className="Partner_main">
        <div className="Partner_container container">
          <Breadcrumbs />

          <section className="Partner_hero">
            <div className="Partner_hero_content">
              <div className="Partner_kicker">{partner.city}</div>
              <h1 className="Partner_page_title">{partner.title}</h1>
              <p className="Partner_page_description">
                {partner.description} Мы собираем партнёрские форматы так, чтобы чай не терял глубину
                и тактильность даже в коммерческом контексте: будь то витрина, ресторанная подача,
                подписка, подарочная серия или сезонный релиз.
              </p>

              <button
                type="button"
                className="Partner_site_link"
                onClick={() => window.dispatchEvent(new CustomEvent('app:open-contact-modal'))}
              >
                Обсудить формат сотрудничества
              </button>
            </div>

            <div className="Partner_hero_cards">
              {stats.map(stat => (
                <article className="Partner_stat_card" key={`${partner.id}-${stat.primaryLabel}`}>
                  <div className="Partner_stat_number">{stat.primary}</div>
                  <div className="Partner_stat_bottom">
                    <div className="Partner_stat_label">{stat.primaryLabel}</div>
                    <div className="Partner_stat_cities">{stat.secondary}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <ContactForm />
      <Footer />
    </>
  );
};

export default PartnerDetailPage;
