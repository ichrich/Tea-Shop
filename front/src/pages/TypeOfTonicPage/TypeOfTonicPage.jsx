import React from "react";
import TypeOfTonic from "../../components/TypeOfTonic/TypeOfTonic.jsx";
import FAQ from "../../components/Catalog/FAQ/FAQ.jsx";

import Header from "../../components/Home/Header/Header.jsx";
import {Footer} from "../../components/Home/Footer/Footer.jsx";
import {ContactForm} from "../../components/Home/ContactForm/ContactForm.jsx";
import {SeoText} from "../../components/Home/SeoText/SeoText.jsx";



export function TypeOfTonicPage(){
    return (
        <>
            <Header />
                <main>
                    <div style={{backgroundColor: 'var(--clr-bg)', borderRadius: ''}}>
                        <TypeOfTonic/>
                        <FAQ/>

                    </div>
                    <div>
                        <ContactForm/>
                    </div>
                    <div>
                        <SeoText/>
                    </div>
                </main>
            <div style={{backgroundColor: 'var(--clr-bg)', borderRadius: ''}}>
                <Footer />
            </div>
        </>

    )
}
export default TypeOfTonicPage;
