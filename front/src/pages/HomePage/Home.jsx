import React from 'react';
import { Hero } from '../../components/Home/Hero/Hero.jsx';
import { Tonics } from '../../components/Home/Tonics/Tonics.jsx';
import { Catalog } from '../../components/Home/Catalog/Catalog.jsx';
import { About } from '../../components/Home/About/About.jsx';
import { ContactForm } from '../../components/Home/ContactForm/ContactForm.jsx';
import './Home.css';
import Header from '../../components/Home/Header/Header.jsx';
import { Footer } from '../../components/Home/Footer/Footer.jsx';
import { Partners } from '../../components/Home/Partners/Partners.jsx';
import { Blog } from '../../components/Home/Blog/Blog.jsx';
import { SeoText } from '../../components/Home/SeoText/SeoText.jsx';
import { HOME_PARTNER_ITEMS } from '../../constants/brandContent.js';

export const Home = () => {
  return (
    <>
      <Header />
      <main>
        <div className="First_block">
          <Hero />
          <Tonics />
          <Catalog />
          <About />
        </div>

        <div className="Second_block">
          <Partners
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
          <Blog />
        </div>

        <ContactForm />

        <div className="Third_block">
          <SeoText />
        </div>
      </main>

      <div className="Home_footer_wrap">
        <Footer />
      </div>
    </>
  );
};
