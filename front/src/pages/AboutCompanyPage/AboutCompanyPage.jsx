import React from 'react';
import Header from '../../components/Home/Header/Header.jsx';
import AboutCompany from '../../components/About/AboutCompany/AboutCompany.jsx';
import Invitation from '../../components/About/Invitation/Invitation.jsx';
import { SeoText } from '../../components/Home/SeoText/SeoText.jsx';
import { Footer } from '../../components/Home/Footer/Footer.jsx';
import PartnersGallery from '../../components/About/PartnersGallery/PartnersGallery.jsx';
import TeaStoryScroller from '../../components/Tea/TeaStoryScroller/TeaStoryScroller.jsx';
import './AboutCompanyPage.css';
import { ABOUT_STORY_CONFIG } from '../../constants/brandContent.js';

export const AboutCompanyPage = () => {
  return (
    <>
      <Header />
      <main className="about-page">
        <div className="First_block">
          <AboutCompany />

          <div className="about-points-scene">
            <TeaStoryScroller
              className="about-points-scene__story"
              config={ABOUT_STORY_CONFIG}
            />
          </div>

          <div>
            <Invitation />
          </div>

          <PartnersGallery />
        </div>

        <div className="Second_block">
          <SeoText pageKey="about-company" />
        </div>
      </main>
      <div className="about-page__footer">
        <Footer />
      </div>
    </>
  );
};

export default AboutCompanyPage;
