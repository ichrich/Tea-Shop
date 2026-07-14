import React from "react";
import "./NotFoundPage.css";
import Header from "../../components/Home/Header/Header.jsx";
import { Footer } from "../../components/Home/Footer/Footer.jsx";

export const NotFoundPage = () => {
    return (
        <>
            <Header />
            <main>
                <section className="NotFound">
                    <div className="NotFound_container container">
                        <h1 className="NotFound_title">Страница не найдена</h1>
                        <button
                            type="button"
                            className="NotFound_button"
                            onClick={() => (window.location.href = "/")}
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

