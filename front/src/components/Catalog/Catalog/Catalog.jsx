import React, { useState, useEffect } from 'react';
import './Catalog.css';
import { SITE_IMAGES } from '../../../constants/siteImages.js';
import Galochka from '../../../assets/Image/galochka.svg';
import GalochkaPrime from '../../../assets/Image/GalochkaPrime.svg';
import FilterIcon from '../../../assets/Image/Filter.svg';
import ProductModal from '../ProductModal/ProductModal';
import DetailedProductCard from "../DetailedProductCard/DetailedProductCard.jsx";
import Cart from '../../Cart/Cart/Cart.jsx';
import Breadcrumbs from "../../Breadcrumbs/Breadcrumbs.jsx";  // Импортируем компонент корзины
import { normalizeTeaContent } from '../../../utils/teaContent.js';

const Catalog = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);  // Состояние для корзины
    const [addingToCart, setAddingToCart] = useState(false);  // Анимация кнопки

    const handleCardClick = async (product) => {
        try {
            const response = await fetch(`/api/catalog/product/${product.id}`);
            if (response.ok) {
                const fullProductData = normalizeTeaContent(await response.json());
                setSelectedProduct(fullProductData);
                setModalOpen(true);
            } else {
                setSelectedProduct(product);
                setModalOpen(true);
            }
        } catch (err) {
            console.error('Ошибка загрузки данных товара:', err);
            setSelectedProduct(product);
            setModalOpen(true);
        }
    };
    const handleAddToCart = (product) => {
        setAddingToCart(true);
        console.log('Добавлен товар:', product);
        setTimeout(() => {
            setAddingToCart(false);
            setCartOpen(true);  // Открываем корзину
        }, 600);
    };

    const [dropdownOpen, setDropdownOpen] = useState({
        type: false,
        price: false,
        benefit: false
    });

    const [filters, setFilters] = useState({
        priceFrom: '',
        priceTo: '',
        types: [], // ['Сенча', 'Ламинария', 'Фукус']
        benefits: [] // ['Умственная деятельность', 'Физическое здоровье', 'Лечение стресса']
    });

    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/catalog/1');
                if (response.ok) {
                    const data = normalizeTeaContent(await response.json());
                    const activeProducts = (data.products || []).filter(p => p.active === 1).slice(0, 8);
                    setAllProducts(activeProducts);
                }
            } catch (err) {
                console.error('Ошибка загрузки товаров:', err);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const productId = Number(params.get('productId'));
        if (!Number.isFinite(productId) || productId <= 0) return;
        const fromLoaded = allProducts.find((p) => Number(p.id) === productId);
        if (fromLoaded) {
            handleCardClick(fromLoaded);
            params.delete('productId');
            const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
            window.history.replaceState({}, '', clean);
        }
    }, [allProducts]);

    const toggleDropdown = (name) => {
        setDropdownOpen(prev => {
            const newState = { type: false, price: false, benefit: false };
            newState[name] = !prev[name];
            return newState;
        });
    };

    const toggleFilterPanel = () => {
        setFilterPanelOpen(!filterPanelOpen);
    };
    const applyFilters = (productsList) => {
        return productsList.filter(product => {
            if (filters.priceFrom && product.price < parseFloat(filters.priceFrom)) {
                return false;
            }
            if (filters.priceTo && product.price > parseFloat(filters.priceTo)) {
                return false;
            }
            if (filters.types.length > 0) {
                const productType = product.category || product.name || '';
                const matchesType = filters.types.some(type => 
                    productType.toLowerCase().includes(type.toLowerCase())
                );
                if (!matchesType) return false;
            }
            if (filters.benefits.length > 0) {
                const productBenefits = product.discription || product.description || '';
                const matchesBenefit = filters.benefits.some(benefit => 
                    productBenefits.toLowerCase().includes(benefit.toLowerCase())
                );
                if (!matchesBenefit) return false;
            }
            return true;
        });
    };
    const filteredProducts = applyFilters(allProducts).filter(p => p.active === 1).slice(0, 8);
    const detailedProducts = filteredProducts.slice(0, 10).map((p, idx) => ({
        id: p.id,
        name: p.name || 'Авторский чай',
        subtitle: p.category ? `/${p.category}` : '',
        price: `${p.price || 0} ₽`,
        images: p.image ? [p.image] : [SITE_IMAGES.placeholder],
        description:
          p.discription || p.description || 'Чистый вкус, понятный профиль заваривания и спокойная подача для ежедневного ритуала.',
        characteristics: [],
        certificates: []
    }));
    const products = filteredProducts.map((p, idx) => ({
        id: p.id,
        name: p.name || 'Авторский чай',
        price: p.price || '0',
        description: p.discription || '',
        size: p.size || ['medium', 'small', 'large', 'large', 'small', 'medium', 'small', 'medium'][idx % 8] || 'medium',
        image: p.image || SITE_IMAGES.placeholder,
        cardClass: `product-card-${(idx % 8) + 1}`
    }));

    return (
        <div className="catalog">
            <div className="container">
                <Breadcrumbs />
                <div className="catalog__header">

                    <h1 className="Katalog">Каталог</h1>

                    
                    <div className="filter-buttons desktop-filters">
                        <div className="filter-dropdown">
                            <button
                                className={`Knopka_filtry_katalog ${dropdownOpen.type ? 'active' : ''}`}
                                onClick={() => toggleDropdown('type')}
                            >
                                Тип чая
                                <img src={Galochka} alt="arrow" />
                            </button>
                            {dropdownOpen.type && (
                                <div className="Component_54">
                                    {['Сенча', 'Матча', 'Улун'].map((type) => (
                                        <label key={type}>
                                            <input
                                                type="checkbox"
                                                checked={filters.types.includes(type)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters(prev => ({ ...prev, types: [...prev.types, type] }));
                                                    } else {
                                                        setFilters(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }));
                                                    }
                                                }}
                                            />
                                            <span>{type}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="filter-dropdown">
                            <button
                                className={`Knopka_filtry_katalog ${dropdownOpen.price ? 'active' : ''}`}
                                onClick={() => toggleDropdown('price')}
                            >
                                Цена
                                <img src={Galochka} alt="arrow" />
                            </button>
                            {dropdownOpen.price && (
                                <div className="Component_53">
                                    <div className="price-input-group">
                                        <label className="price-label">От</label>
                                        <input
                                            type="number"
                                            value={filters.priceFrom}
                                            onChange={(e) => setFilters(prev => ({...prev, priceFrom: e.target.value}))}
                                            className="price-input"
                                        />
                                    </div>
                                    <div className="price-input-group">
                                        <label className="price-label">До</label>
                                        <input
                                            type="number"
                                            value={filters.priceTo}
                                            onChange={(e) => setFilters(prev => ({...prev, priceTo: e.target.value}))}
                                            className="price-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="filter-dropdown">
                            <button
                                className={`Knopka_filtry_katalog ${dropdownOpen.benefit ? 'active' : ''}`}
                                onClick={() => toggleDropdown('benefit')}
                            >
                                Вид пользы
                                <img src={Galochka} alt="arrow" />
                            </button>
                            {dropdownOpen.benefit && (
                                <div className="Component_51">
                                    {['Умственная деятельность', 'Физическое здоровье', 'Лечение стресса'].map((benefit) => (
                                        <label key={benefit}>
                                            <input
                                                type="checkbox"
                                                checked={filters.benefits.includes(benefit)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters(prev => ({ ...prev, benefits: [...prev.benefits, benefit] }));
                                                    } else {
                                                        setFilters(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== benefit) }));
                                                    }
                                                }}
                                            />
                                            <span>{benefit}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    
                    <div className="filter-toggle-wrapper">
                        <button className="filter-toggle-btn" onClick={toggleFilterPanel}>
                            <img src={FilterIcon} alt="Фильтры" />
                        </button>

                        {filterPanelOpen && (
                            <div className="filter-dropdown-panel">
                                <div className="filter-section">
                                    <h3 className="filter-section-title">Тип чая</h3>
                                    <div className="filter-options">
                                        {['Сенча', 'Матча', 'Улун'].map((type) => (
                                            <label key={type}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.types.includes(type)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFilters(prev => ({ ...prev, types: [...prev.types, type] }));
                                                        } else {
                                                            setFilters(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }));
                                                        }
                                                    }}
                                                />
                                                <span>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h3 className="filter-section-title">Цена</h3>
                                    <div className="filter-price-inputs">
                                        <div className="price-input-group">
                                            <label className="price-label">От</label>
                                            <input
                                                type="number"
                                                value={filters.priceFrom}
                                                onChange={(e) => setFilters(prev => ({...prev, priceFrom: e.target.value}))}
                                                className="price-input"
                                            />
                                        </div>
                                        <div className="price-input-group">
                                            <label className="price-label">До</label>
                                            <input
                                                type="number"
                                                value={filters.priceTo}
                                                onChange={(e) => setFilters(prev => ({...prev, priceTo: e.target.value}))}
                                                className="price-input"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="filter-section">
                                    <h3 className="filter-section-title">Вид пользы</h3>
                                    <div className="filter-options">
                                        {['Умственная деятельность', 'Физическое здоровье', 'Лечение стресса'].map((benefit) => (
                                            <label key={benefit}>
                                                <input
                                                    type="checkbox"
                                                    checked={filters.benefits.includes(benefit)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFilters(prev => ({ ...prev, benefits: [...prev.benefits, benefit] }));
                                                        } else {
                                                            setFilters(prev => ({ ...prev, benefits: prev.benefits.filter(b => b !== benefit) }));
                                                        }
                                                    }}
                                                />
                                                <span>{benefit}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                
                <div className="detailed-products-grid">
                    {detailedProducts.map((product, index) => (
                        <div key={product.id} className={`DetailedProductCard-wrapper ${index % 2 === 1 ? 'reverse' : ''}`}>
                            <DetailedProductCard
                                key={product.id}
                                product={product}
                                index={index}
                                onAddToCart={handleAddToCart}
                                addingToCart={addingToCart}
                            />
                        </div>
                    ))}
                </div>

                
                <div className="products-grid">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className={`product-card ${product.cardClass}`}
                            data-size={product.size}
                            onClick={() => handleCardClick(product)}
                        >
                            <div className="product-image">
                                
                                <img src={product.image} alt={product.name || 'Авторский чай'} />
                            </div>
                            <div className="product-info">
                                <h3>{product.name || 'Авторский чай'}</h3>
                                <p className="description">
                                    {product.description || 'Сбалансированный листовой чай с мягкой текстурой вкуса и прозрачным послевкусием.'}
                                </p>
                                <p className="price">{product.price ? `${product.price} ₽` : 'По запросу'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <ProductModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    product={selectedProduct}
                />

                
            </div>

            
            <Cart
                isOpen={cartOpen}
                onClose={() => setCartOpen(false)}
            />
        </div>
    );
};

export default Catalog;

