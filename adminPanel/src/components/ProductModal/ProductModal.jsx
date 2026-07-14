import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '../../apiConfig';
import { apiRequest } from '../../utils/api';
import './ProductModal.css';
import ArrowIcon from '../../assets/icons/galochka.svg';
import ProductPhoto from '../../assets/images/ProductPhoto.jpg';
import ProductPhoto2 from '../../assets/images/ProductPhoto2.png';
import PlaceholderImg from '../../assets/images/placeholder.jpg';
import { useNavigate } from 'react-router-dom';


function getRandomElements(array, count) {
    if (!array) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
const ProductModal = ({ isOpen, onClose, product }) => {
    const handleImageError = (e) => {
        const img = e?.currentTarget;
        if (!img) return;
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = 'true';
        img.src = PlaceholderImg;
    };

    const handleOverlayClick = (e) => {
        if (e.target.className === 'product-modal-overlay' || e.target.className === 'product-modal-overlay tm-overlay') {
            onClose();
        }
    };
    const navigate = useNavigate();
    let [quantity, setQuantity] = useState(1);
    const [isTabletMobile, setIsTabletMobile] = useState(false);
    const [products, setAbout] = useState([]);
    const [Char, setChar] = useState([]);
    const [CERF,setCERF] = useState([]);

useEffect(() => {
        let canceled = false;
        apiRequest('/api/catalog/3').then(async (r) => {
            if (canceled) return;
            if (!r.ok) return;
            const data = await r.json();
            setAbout(data);
        });
        return () => { canceled = true; };
    }, []);

    useEffect(() => {
        let canceled = false;
        apiRequest('/api/characteristic/').then(async (r) => {
            if (canceled) return;
            if (!r.ok) { setChar([]); return; }
            const data = await r.json();
            setChar(Array.isArray(data) ? data : []);
        });
        return () => { canceled = true; };
    }, []);

    useEffect(() => {
        let canceled = false;
        apiRequest('/api/cerf').then(async (r) => {
            if (canceled) return;
            if (!r.ok) { setCERF([]); return; }
            const data = await r.json();
            setCERF(Array.isArray(data) ? data : []);
        });
        return () => { canceled = true; };
    }, []);
    useEffect(() => {
        const checkWidth = () => {
            setIsTabletMobile(window.innerWidth <= 1024);
        };

        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

const downloadCertificate = async (cert) => {
  const res = await apiRequest(`/download/${cert.url}`);
  if (!res.ok) throw new Error('Network response was not ok');
  const blob = await res.blob();
  let filename = cert?.header ? `${cert.header}.pdf` : 'certificate.pdf';
  const cd = res.headers.get('Content-Disposition');
  if (cd) {
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(cd);
    if (match && match[1]) filename = match[1].replace(/['"]/g, '');
  }
  if (!filename.includes('.')) {
    filename += '.pdf';
  }
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
};

    const relatedProducts = useMemo(() => {
        if (!products || !products.products) {
            return [];
        }
        return getRandomElements(products.products, 3);
    }, [products]);

    const renderDesktopView = () => (
        <div className="product-modal-overlay" onClick={handleOverlayClick}>
            <div className="product-modal">
                <button className="modal-close-btn" onClick={onClose} aria-label="Закрыть">
                    <span className="close-icon"></span>
                </button>

                <div className="modal-content">
                    <div className="modal-left">
                        <div className="modal-product-image">
                            <img
                                src={product?.image || PlaceholderImg}
                                alt={product?.name}
                                onError={handleImageError}
                            />
                        </div>
                    </div>

                    <div className="modal-right">
                        <h1 className="modal-product-title">{product?.name}</h1>
                        <p className="modal-product-price">{product?.price} рублей</p>

                        <div className="modal-characteristics">
                            {Char
                                .filter(c => c.product_id === product?.id)
                                .map((c, i) => (
                                    <div className="characteristic-row" key={i}>
                                        <span className="characteristic-label">{c?.name}</span>
                                        <span className="characteristic-value">
                                            {c.description}
                                        </span>
                                    </div>
                                ))}
                        </div>

                        <div className="modal-description">
                            <p>
                                {product?.discription}
                            </p>
                        </div>


                    </div>
                </div>

                <div className="modal-bottom-sections">
                    <section className="modal-section certificates-section">
                        <h2 className="section-title">Сертификаты</h2>
                        <div className="certificates-grid">
                                                     {CERF
                                .filter(c => c.product_id === product?.id)
                                .slice(0, 2)
                                .map((c, i) => (
                            <div className="certificate-card" key={i}>
                                <div className="certificate-content">
                                    <h3>{c.header}</h3>
                                    <p>{c.size ? `Размер файла: ${c.size}` : 'Размер файла'}</p>
                                    <button className="view-btn" onClick={() => downloadCertificate(c)}>Скачать</button>
                                </div>
                            </div>
                                                            ))}

                        </div>
                    </section>

                    <section className="modal-section related-section">
                        <div className="section-header">
                            <h2 className="section-title">Смотрите также</h2>
                            <div className="slider-controls">
                                <button className="slider-btn slider-btn-prev">
                                    <img src={ArrowIcon} alt="Назад" />
                                </button>
                                <button className="slider-btn slider-btn-next">
                                    <img src={ArrowIcon} alt="Вперед" />
                                </button>
                            </div>
                        </div>
                        <div className="related-products">
                            {relatedProducts?.map((rp, index) => (
                                <div key={rp.id} className={`related-product-card ${index === 0 ? 'large' : 'medium'}`}>
                                    <div className="related-product-image">
                                        <img
                                            src={rp.image || PlaceholderImg}
                                            alt="Товар"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="related-product-info">
                                        <h3>{rp.name}</h3>
                                        <p className="related-price">{rp.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );

    const renderTabletMobileView = () => (
        <div className="product-modal-overlay tm-overlay" onClick={handleOverlayClick}>
            <div className="product-modal tm-modal">
                <button className="modal-close-btn tm-close-btn" onClick={onClose} aria-label="Закрыть">
                    <span className="close-icon"></span>
                </button>

                <div className="tm-product-header">
                    <div className="tm-product-left">
                        <div className="tm-product-image">
                            <img
                                src={product?.image || PlaceholderImg}
                                alt={product?.name}
                                onError={handleImageError}
                            />
                        </div>
                    </div>

                    <div className="tm-product-right">
                        <h1 className="tm-product-title">{product?.name}</h1>
                        <p className="tm-product-price">{product?.price} рублей</p>

                        <div className="tm-product-chars">
                            {Char                                
                            .filter(c => c.product_id === product?.id)
                                .slice(0, 2)
                                .map((c, i) => (
                                    <div className="characteristic-row" key={i}>
                                        <span className="characteristic-label">{c.name}</span>
                                        <span className="characteristic-value">
                                            {c.description}
                                        </span>
                                    </div>
                                ))}
                        </div>

                        <button className="tm-product-more">Большие характеристики</button>
                    </div>
                </div>

                <div className="tm-product-text">
                    <p>
                        {product?.discription}
                    </p>
                </div>


                <section className="tm-section">
                    <h2 className="tm-section-title">СМОТРИТЕ ТАКЖЕ</h2>
                    <div className="tm-related-grid">
                        {relatedProducts?.map((rp, index) => {
                            const isLarge = index === 0;
                            return (
                                <div key={rp.id} className={`tm-related-card tm-card-${isLarge ? 'large' : 'small'}`}>
                                    <div className="tm-related-image">
                                        <img
                                            src={rp.image || PlaceholderImg}
                                            alt="Товар"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    <div className="tm-related-info">
                                        <h3>{rp.name}</h3>
                                        <p>{rp.price}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="tm-section">
                    <h2 className="tm-section-title">СЕРТИФИКАТЫ</h2>
                    <div className="tm-certs-grid">
                         {(Array.isArray(CERF) ? CERF : [])
                                .filter(c => c.product_id === product?.id)
                                .slice(0, 2)
                                .map((c, i) => (
                        <div className="tm-cert-card" key={i}>
                            <h3>{c.header}</h3>
                            <p>{c.size ? `Размер файла: ${c.size}` : 'Размер файла'}</p>
                            <button className="tm-view-btn" onClick={() => downloadCertificate(c)}>Скачать</button>
                        </div>
                                ))}
                    </div>
                </section>
            </div>
        </div>
    );

    const memoizedDesktopView = useMemo(() => renderDesktopView(), [isOpen, relatedProducts, product, Char, quantity, isTabletMobile, products]);
    const memoizedTabletMobileView = useMemo(() => renderTabletMobileView(), [isOpen, relatedProducts, product, Char, quantity, isTabletMobile, products]);

    return isOpen ? (isTabletMobile ? memoizedTabletMobileView : memoizedDesktopView) : null;
};

export default ProductModal;