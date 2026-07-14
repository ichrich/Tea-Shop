import React, { useState, useEffect, useRef } from 'react';
import './ProductModal.css';
import { SITE_IMAGES } from '../../../constants/siteImages.js';
import { addToCart } from '../../../utils/cart.js';

const ProductModal = ({ product, onClose }) => {
    const [qty, setQty] = useState(1);
    const overlayRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    if (!product) return null;

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    const rawPrice = (product.price ?? 0).toString();
    const priceNumber =
        Number(rawPrice.replace(/\s/g, '').replace(/₽/g, '').replace(/[^\d.]/g, '')) || 0;
    const formattedPrice = priceNumber ? priceNumber.toLocaleString('ru-RU') : '-';
    const formattedTotal = priceNumber
        ? (priceNumber * qty).toLocaleString('ru-RU')
        : '-';

    const specsFromDb = Array.isArray(product.characteristics)
        ? product.characteristics.map((c) => ({
              label: c.name || '-',
              value: c.description || '-',
          }))
        : [];

    const certsFromDb = Array.isArray(product.certificates)
        ? product.certificates.map((c) => ({
              id: c.id,
              name: c.title || 'Название сертификата',
              size: c.size || '',
              url: c.url || c.link || null,
          }))
        : [];

    const specs = specsFromDb.filter(
        (item) =>
            (item.label && item.label.trim() !== '') ||
            (item.value && item.value.trim() !== '')
    );

    const certs = certsFromDb;

    const imageSrc = product.image || SITE_IMAGES.placeholder;

    const displayName = product.name || '-';
    const displayDescription = product.description || '-';
    const displayStock =
        typeof product.quantity === 'number' ? `${product.quantity} шт.` : '-';

    const handleAddToCart = () => {
        addToCart(
            {
                id: product.id,
                name: displayName,
                price: priceNumber,
                image: imageSrc,
                description: displayDescription,
                quantity: product.quantity,
            },
            qty,
        );
    };

    const handleBuyNow = () => {
        handleAddToCart();
        onClose();
        window.requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent('app:open-cart', { detail: { checkout: true } }));
        });
    };

    return (
        <div className="pop_overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="pop_modal">
                <button className="pop_close" onClick={onClose} aria-label="Закрыть">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="pop_left">
                    <div className="pop_breadcrumbs">
                        Главная  ›  Каталог  ›  Страница товара
                    </div>
                    <div className="pop_photo_container">
                        <img
                            src={imageSrc}
                            alt={product.name || 'Чайный продукт'}
                            className="pop_main_img"
                            onError={event => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = SITE_IMAGES.placeholder;
                            }}
                        />
                    </div>
                </div>

                <div className="pop_right">
                    <header className="pop_head">
                        <h2 className="pop_name">{displayName}</h2>
                        <span className="pop_price">
                            {formattedPrice !== '-' ? `${formattedPrice} ₽` : '-'}
                        </span>
                    </header>

                    <p className="pop_desc">{displayDescription}</p>

                    <div className="pop_stock">В наличии {displayStock}</div>

                    <div className="pop_purchase_row">
                        <div className="pop_qty_selector">
                            <button className="minus" onClick={() => setQty((q) => Math.max(1, q - 1))}></button>
                            <span>{qty}</span>
                            <button className="plus" onClick={() => setQty((q) => q + 1)}></button>
                        </div>
                        <button className="pop_btn_buy" type="button" onClick={handleBuyNow}>КУПИТЬ СЕЙЧАС</button>
                    </div>

                    <button className="pop_btn_cart" type="button" onClick={handleAddToCart}>
                        <span>ДОБАВИТЬ В КОРЗИНУ</span>
                        <span className="pop_btn_total">
                            {formattedTotal !== '-' ? `${formattedTotal} ₽` : '-'}
                        </span>
                    </button>

                    {specs.length > 0 && (
                        <div className="pop_section">
                            <h3 className="pop_section_title">ХАРАКТЕРИСТИКИ</h3>
                            <div className="pop_specs_list">
                                {specs.map((item, i) => (
                                    <div key={i} className="pop_spec_item">
                                        <span className="pop_spec_label">
                                            {item.label?.trim() || '-'}
                                        </span>
                                        <span className="pop_spec_value">
                                            {item.value?.trim() || '-'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {certs.length > 0 && (
                        <div className="pop_section">
                            <h3 className="pop_section_title">СЕРТИФИКАТЫ</h3>
                            <div className="pop_certs_list">
                                {certs.map((cert) => (
                                    <div key={cert.id} className="pop_cert_item">
                                        <span className="pop_cert_name">{cert.name || '-'}</span>
                                        <div className="pop_cert_actions">
                                            {cert.url && (
                                                <button
                                                    className="pop_download_btn"
                                                    type="button"
                                                    onClick={() => cert.url && window.open(cert.url, '_blank')}
                                                >
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                                    </svg>
                                                    Скачать
                                                </button>
                                            )}
                                            <span className="pop_cert_size">
                                                {cert.size || (cert.url ? '-' : '')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
