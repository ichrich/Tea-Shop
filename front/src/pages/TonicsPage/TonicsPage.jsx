import React from 'react';
import Header from '../../components/Home/Header/Header.jsx';
import TonicsHero from '../../components/Tonics/TonicsHero/TonicsHero.jsx';
import TeaStoryScroller from '../../components/Tea/TeaStoryScroller/TeaStoryScroller.jsx';
import { Tonics } from '../../components/Home/Tonics/Tonics.jsx';
import { ContactForm } from '../../components/Home/ContactForm/ContactForm.jsx';
import { SeoText } from '../../components/Home/SeoText/SeoText.jsx';
import { Footer } from '../../components/Home/Footer/Footer.jsx';
import './TonicsPage.css';
import { TEA_STORY_CONFIG } from '../../constants/brandContent.js';

export const TonicsPage = () => {
  return (
    <div className="TonicsPage">
      <Header />

      <main>
        <section className="First_block">
          <div className="TonicsPlanetScene">
            <TonicsHero />
            <TeaStoryScroller config={TEA_STORY_CONFIG} />
          </div>

          <div>
            <Tonics showAllLink={false} />
          </div>
        </section>

        <ContactForm />

        <section className="Second_block">
          <SeoText pageKey="tonics" />
        </section>
      </main>

      <div className="TonicsPage_footer">
        <Footer />
      </div>
    </div>
  );
};

export default TonicsPage;
