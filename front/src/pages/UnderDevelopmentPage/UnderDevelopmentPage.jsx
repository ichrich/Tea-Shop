import React from 'react';
import './UnderDevelopmentPage.css';
import Header from '../../components/Home/Header/Header.jsx';
import { Footer } from '../../components/Home/Footer/Footer.jsx';

export const UnderDevelopmentPage = () => {
    return (
        <>
            <Header />
            <main>
                <section className="UnderDevelopment">
                    <div className="UnderDevelopment_container container">
                        <h1 className="UnderDevelopment_title">Страница в разработке</h1>
                        <button
                            type="button"
                            className="UnderDevelopment_button"
                            onClick={() => (window.location.href = '/')}
                        >
                            на главную
                        </button>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};
