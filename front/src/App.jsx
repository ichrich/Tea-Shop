import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLoader } from './components/AppLoader/AppLoader.jsx'

import { Home } from "./pages/HomePage/Home.jsx"
import {TonicsPage} from "./pages/TonicsPage/TonicsPage.jsx"
import {ProductPage} from "./pages/ProductPage/ProductPage.jsx";
import {CatalogPage} from "./pages/CatalogPage/CatalogPage.jsx";
import {AboutCompanyPage} from "./pages/AboutCompanyPage/AboutCompanyPage.jsx";
import {PartnersPage} from "./pages/PartnersPage/PartnersPage.jsx";
import {BlogPage} from "./pages/BlogPage/BlogPage.jsx";
import {BlogArticlePage} from "./components/Blog/BlogArticle/BlogArticlePage.jsx";
import {BlogIdPage} from "./pages/BlogIdPage/BlogIdPage.jsx";
import Breadcrumbs from "./components/Breadcrumbs/Breadcrumbs.jsx";
import {PartnerDetailPage} from "./pages/PartnerDetailPage/PartnerDetailPage.jsx";
import TypeOfTonicPage from "./pages/TypeOfTonicPage/TypeOfTonicPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage/NotFoundPage.jsx";
import { UnderDevelopmentPage } from "./pages/UnderDevelopmentPage/UnderDevelopmentPage.jsx";
import { PolicyOpdPage } from "./pages/PolicyOpdPage/PolicyOpdPage.jsx";
import { ContactModal } from './components/Home/ContactForm/ContactForm.jsx';
import { PageMeta } from './components/PageMeta/PageMeta.jsx';
import { CartToast } from './components/Cart/CartToast/CartToast.jsx';

function App() {
    const [booting, setBooting] = useState(true)

    useEffect(() => {
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const t = window.setTimeout(() => {
            setBooting(false)
            document.body.style.overflow = prevOverflow
        }, 1100)
        return () => {
            window.clearTimeout(t)
            document.body.style.overflow = prevOverflow
        }
    }, [])

    return (
        <>
            <AppLoader visible={booting} />
            <PageMeta />
            <ContactModal />
            <CartToast />
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/product" element={<ProductPage />} />
                <Route path="/tea/sencha" element={<ProductPage />} />
                <Route path="/tea" element={<TonicsPage />} />
                <Route path="/tonics/sencha" element={<Navigate to="/tea/sencha" replace />} />
                <Route path="/tonics" element={<Navigate to="/tea" replace />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/about" element={<AboutCompanyPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/partners/:id" element={<PartnerDetailPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogIdPage />} />
                <Route path="/catalog/all" element={<TypeOfTonicPage />} />
                <Route path="/under-development" element={<UnderDevelopmentPage />} />
                <Route path="/policy-opd" element={<PolicyOpdPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </>
    )
}

export default App
