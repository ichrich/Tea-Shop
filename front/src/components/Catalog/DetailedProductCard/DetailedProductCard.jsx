import React, { useState, useEffect } from 'react';
import './DetailedProductCard.css';
import WhiteGalochka from '../../../assets/Image/WhiteGalochka.svg';

const DetailedProductCard = ({ product, onAddToCart, addingToCart, index }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [openCertificates, setOpenCertificates] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [isTablet, setIsTablet] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsTablet(width >= 768 && width <= 1024);
            setIsMobile(width < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleCertificate = (certIndex) => {
        setOpenCertificates(prev => ({
            ...prev,
            [certIndex]: !prev[certIndex]
        }));
    };

    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        setQuantity(prev => (prev > 1 ? prev - 1 : 1));
    };

    const calculateTotalPrice = () => {
        const basePrice = parseInt(product.price.replace(/[^\d]/g, ''));
        const totalPrice = basePrice * quantity;
        return totalPrice.toLocaleString('ru-RU');
    };

    const handleAddToCartClick = () => {
        if (onAddToCart) {
            onAddToCart({
                ...product,
                quantity,
                totalPrice: calculateTotalPrice()
            });
        }
    };

    const handleRequestPurchase = () => {
        window.dispatchEvent(new CustomEvent('app:open-contact-modal'));
    };
    const isEven = index % 2 !== 0;
    const cardClasses = isTablet
        ? `DetailedProductCard DetailedProductCard--tablet ${isEven ? 'DetailedProductCard--reversed' : ''}`
        : 'DetailedProductCard';
    if (isTablet) {
        return (
            <div className={cardClasses}>
                
                <div className="DetailedProductCard_left">
                    {isEven ? (
                        <>
                            <div className="DetailedProductCard_header">
                                <h2 className="DetailedProductCard_title">
                                    {product.name}
                                    <span className="DetailedProductCard_subtitle">{product.subtitle}</span>
                                </h2>
                                <p className="DetailedProductCard_price">Цена: {calculateTotalPrice()} ₽</p>
                            </div>

                            <div className="DetailedProductCard_description_block">
                                <p className="DetailedProductCard_description">{product.description}</p>
                            </div>

                            <div className="DetailedProductCard_characteristics">
                                {product.characteristics && product.characteristics.map((char, idx) => (
                                    <div key={idx} className="DetailedProductCard_char_row">
                                        <span className="DetailedProductCard_char_label">{char.label}</span>
                                        <span className="DetailedProductCard_char_value">{char.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="DetailedProductCard_slider">
                                <div className="DetailedProductCard_main_image">
                                    <img src={product.images[currentImageIndex]} alt={product.name} />
                                </div>
                            </div>

                            {product.certificates && product.certificates.length > 0 && (
                                <div className="DetailedProductCard_certificates">
                                    {product.certificates.map((cert, idx) => (
                                        <div key={idx} className="DetailedProductCard_certificate">
                                            <button
                                                className="DetailedProductCard_certificate_toggle"
                                                onClick={() => toggleCertificate(idx)}
                                            >
                                                <span>Сертификат</span>
                                                <img
                                                    src={WhiteGalochka}
                                                    alt="toggle"
                                                    className={`DetailedProductCard_certificate_arrow ${openCertificates[idx] ? 'rotated' : ''}`}
                                                />
                                            </button>

                                            {openCertificates[idx] && (
                                                <div className="DetailedProductCard_certificate_content">
                                                    <div className="DetailedProductCard_certificate_row">
                                                        <span className="DetailedProductCard_certificate_title">{cert.title}</span>
                                                        <button className="DetailedProductCard_certificate_btn">Скачать</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                
                <div className="DetailedProductCard_right">
                    {isEven ? (
                        <>
                            <div className="DetailedProductCard_slider">
                                <div className="DetailedProductCard_main_image">
                                    <img src={product.images[currentImageIndex]} alt={product.name} />
                                </div>
                            </div>

                            {product.certificates && product.certificates.length > 0 && (
                                <div className="DetailedProductCard_certificates">
                                    {product.certificates.map((cert, idx) => (
                                        <div key={idx} className="DetailedProductCard_certificate">
                                            <button
                                                className="DetailedProductCard_certificate_toggle"
                                                onClick={() => toggleCertificate(idx)}
                                            >
                                                <span>Сертификат</span>
                                                <img
                                                    src={WhiteGalochka}
                                                    alt="toggle"
                                                    className={`DetailedProductCard_certificate_arrow ${openCertificates[idx] ? 'rotated' : ''}`}
                                                />
                                            </button>

                                            {openCertificates[idx] && (
                                                <div className="DetailedProductCard_certificate_content">
                                                    <div className="DetailedProductCard_certificate_row">
                                                        <span className="DetailedProductCard_certificate_title">{cert.title}</span>
                                                        <button className="DetailedProductCard_certificate_btn">Скачать</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="DetailedProductCard_header">
                                <h2 className="DetailedProductCard_title">
                                    {product.name}
                                    <span className="DetailedProductCard_subtitle">{product.subtitle}</span>
                                </h2>
                                <p className="DetailedProductCard_price">Цена: {calculateTotalPrice()} ₽</p>
                            </div>

                            <div className="DetailedProductCard_description_block">
                                <p className="DetailedProductCard_description">{product.description}</p>
                            </div>

                            <div className="DetailedProductCard_characteristics">
                                {product.characteristics && product.characteristics.map((char, idx) => (
                                    <div key={idx} className="DetailedProductCard_char_row">
                                        <span className="DetailedProductCard_char_label">{char.label}</span>
                                        <span className="DetailedProductCard_char_value">{char.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                
                <div className="DetailedProductCard_actions">
                    <div className="DetailedProductCard_quantity">
                        <button
                            className="DetailedProductCard_quantity_btn"
                            onClick={handleDecrement}
                        >
                            -
                        </button>
                        <span className="DetailedProductCard_quantity_value">{quantity}</span>
                        <button
                            className="DetailedProductCard_quantity_btn"
                            onClick={handleIncrement}
                        >
                            +
                        </button>
                    </div>
                    <button
                        className="DetailedProductCard_btn DetailedProductCard_btn_buy"
                        onClick={handleRequestPurchase}
                    >
                        Купить сейчас
                    </button>
                    <button
                        className={`DetailedProductCard_btn DetailedProductCard_btn_cart ${addingToCart ? 'adding' : ''}`}
                        onClick={handleAddToCartClick}
                        disabled={addingToCart}
                    >
                        В корзину
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className={cardClasses}>
            <div className="DetailedProductCard_left">
                <div className="DetailedProductCard_slider">
                    <div className="DetailedProductCard_main_image">
                        <img src={product.images[currentImageIndex]} alt={product.name} />
                    </div>
                </div>
            </div>

            <div className="DetailedProductCard_right">
                <div className="DetailedProductCard_header">
                    <div>
                        <h2 className="DetailedProductCard_title">
                            {product.name}
                            <span className="DetailedProductCard_subtitle">{product.subtitle}</span>
                        </h2>
                        <p className="DetailedProductCard_price">Цена: {calculateTotalPrice()} ₽</p>
                    </div>
                </div>

                <div className="DetailedProductCard_content_row">
                    <div className="DetailedProductCard_description_block">
                        <p className="DetailedProductCard_description">{product.description}</p>

                        {product.certificates && product.certificates.length > 0 && (
                            <div className="DetailedProductCard_certificates">
                                {product.certificates.map((cert, idx) => (
                                    <div key={idx} className="DetailedProductCard_certificate">
                                        <button
                                            className="DetailedProductCard_certificate_toggle"
                                            onClick={() => toggleCertificate(idx)}
                                        >
                                            <span>Сертификат</span>
                                            <img
                                                src={WhiteGalochka}
                                                alt="toggle"
                                                className={`DetailedProductCard_certificate_arrow ${openCertificates[idx] ? 'rotated' : ''}`}
                                            />
                                        </button>

                                        {openCertificates[idx] && (
                                            <div className="DetailedProductCard_certificate_content">
                                                <div className="DetailedProductCard_certificate_row">
                                                    <span className="DetailedProductCard_certificate_title">{cert.title}</span>
                                                    <button className="DetailedProductCard_certificate_btn">Скачать</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="DetailedProductCard_characteristics">
                        {product.characteristics && product.characteristics.map((char, idx) => (
                            <div key={idx} className="DetailedProductCard_char_row">
                                <span className="DetailedProductCard_char_label">{char.label}</span>
                                <span className="DetailedProductCard_char_value">{char.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="DetailedProductCard_actions">
                    <div className="DetailedProductCard_quantity">
                        <button
                            className="DetailedProductCard_quantity_btn"
                            onClick={handleDecrement}
                        >
                            -
                        </button>
                        <span className="DetailedProductCard_quantity_value">{quantity}</span>
                        <button
                            className="DetailedProductCard_quantity_btn"
                            onClick={handleIncrement}
                        >
                            +
                        </button>
                    </div>
                    <button
                        className="DetailedProductCard_btn DetailedProductCard_btn_buy"
                        onClick={handleRequestPurchase}
                    >
                        Купить сейчас
                    </button>
                    <button
                        className={`DetailedProductCard_btn DetailedProductCard_btn_cart ${addingToCart ? 'adding' : ''}`}
                        onClick={handleAddToCartClick}
                        disabled={addingToCart}
                    >
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailedProductCard;
