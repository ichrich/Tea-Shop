import Header from "../../components/Home/Header/Header.jsx";
import {Blog} from "../../components/Home/Blog/Blog.jsx";
import {Footer} from "../../components/Home/Footer/Footer.jsx";
import React from "react";

export const BlogPage = () => {
    return (
        <>
            <Header />
            <main>
                <div>
                    <Blog
                        variant="extended"
                        showAllLink={false}
                        showSearchBar={true}
                        showSelects={true}
                    />
                </div>
            </main>
            <div style={{backgroundColor: 'var(--clr-bg)', borderRadius: ''}}>
                <Footer />
            </div>
        </>
    )
}