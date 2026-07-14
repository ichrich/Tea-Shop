import Header from "../../components/Home/Header/Header.jsx";
import {BlogArticlePage} from "../../components/Blog/BlogArticle/BlogArticlePage.jsx";
import {Footer} from "../../components/Home/Footer/Footer.jsx";
import React from "react";

export const BlogIdPage = () => {
    return (
        <>
            <Header />
            <main>
                <div>
                    <BlogArticlePage/>
                </div>
            </main>
            <div style={{scrollSnapAlign: 'start'}}>
                <Footer />
            </div>
        </>
    )
}