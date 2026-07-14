import React, { useEffect, useRef, useState } from 'react';
import './Header.css';
import Market from '../../../assets/Image/Market.svg';
import Cart from '../../Cart/Cart/Cart.jsx';
import { SITE_BRAND } from '../../../constants/siteBrand.js';
import { BRAND_NAV } from '../../../constants/brandContent.js';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isForcedHidden, setIsForcedHidden] = useState(false);
  const lastScrollY = useRef(0);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isCartOpen) {
      const timer = window.setTimeout(() => setIsCheckout(false), 220);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isCartOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 96) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
        setIsMenuOpen(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onForceHeader = e => {
      setIsForcedHidden(Boolean(e?.detail?.hidden));
    };

    const onOpenCart = event => {
      setIsMenuOpen(false);
      setIsCheckout(Boolean(event?.detail?.checkout));
      setIsCartOpen(true);
    };

    window.addEventListener('app:force-header', onForceHeader);
    window.addEventListener('app:open-cart', onOpenCart);
    return () => {
      window.removeEventListener('app:force-header', onForceHeader);
      window.removeEventListener('app:open-cart', onOpenCart);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const closeCart = () => setIsCartOpen(false);

  const navGroups = [
    { title: 'Каталог', items: BRAND_NAV.catalog },
    { title: 'Чай', items: BRAND_NAV.tea },
    { title: 'Информация', items: BRAND_NAV.info },
  ];

  return (
    <>
      <header className={`Header ${isVisible && !isForcedHidden ? 'Header--visible' : 'Header--hidden'}`}>
        <div className="container">
          <div className="Header_container">
            <a href="/" className="Header_brand" aria-label={SITE_BRAND.name}>
              <span className="Logo">{SITE_BRAND.shortName}</span>
              <span className="Header_brand_copy">
                <span className="Header_brand_title">{SITE_BRAND.name}</span>
                <span className="Header_brand_note">{SITE_BRAND.tagline}</span>
              </span>
            </a>

            <div className="Header_actions">
              <button
                className="Header_cart_button"
                onClick={() => {
                  setIsCartOpen(prev => !prev);
                  setIsMenuOpen(false);
                }}
                aria-label="Открыть корзину"
                type="button"
              >
                <img src={Market} alt="" />
              </button>

              <div className="Header_menu_shell" ref={menuRef}>
                <button
                  className={`Header_menu_button ${isMenuOpen ? 'is-active' : ''}`}
                  onClick={() => {
                    setIsMenuOpen(prev => !prev);
                    setIsCartOpen(false);
                  }}
                  aria-label="Открыть меню"
                  type="button"
                >
                  <span />
                  <span />
                </button>

                {isMenuOpen && (
                  <nav className="Header_menu_dropdown">
                    {navGroups.map(group => (
                      <div className="Header_menu_group" key={group.title}>
                        <span className="Header_menu_label">{group.title}</span>
                        <div className="Header_menu_links">
                          {group.items.map(item => (
                            <a
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="Header_menu_link"
                            >
                              {item.text}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <Cart
        isOpen={isCartOpen}
        onClose={closeCart}
        isCheckout={isCheckout}
        setIsCheckout={setIsCheckout}
      />

    </>
  );
};

export default Header;
