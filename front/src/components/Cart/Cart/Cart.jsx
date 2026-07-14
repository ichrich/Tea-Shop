import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './Cart.css';
import DeleteIcon from '../../../assets/Image/DeleteIcon.svg';
import { getCartItems, setCartItems } from '../../../utils/cart.js';
import { PERSONAL_DATA_POLICY_URL } from '../../../constants/personalDataPolicy.js';

const EMPTY_CHECKOUT = {
  name: '',
  surname: '',
  phone: '',
  email: '',
  address: '',
  delivery: '',
  agreedToTerms: false,
};

const formatPrice = value => `${new Intl.NumberFormat('ru-RU').format(Number(value) || 0)} ₽`;

const Cart = ({ isOpen, onClose, isCheckout, setIsCheckout }) => {
  const [cartItems, setCartItemsState] = useState(() => getCartItems());

  const syncCart = useCallback(updater => {
    setCartItemsState(previous => {
      const next = typeof updater === 'function' ? updater(previous) : updater;
      setCartItems(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const syncExternalChange = () => setCartItemsState(getCartItems());
    window.addEventListener('cart:changed', syncExternalChange);
    return () => window.removeEventListener('cart:changed', syncExternalChange);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const totalSum = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0),
    [cartItems],
  );

  const updateQuantity = useCallback((itemId, quantity) => {
    const safeQuantity = Math.min(10, Math.max(1, quantity));
    syncCart(previous => previous.map(item => (
      item.id === itemId ? { ...item, quantity: safeQuantity } : item
    )));
  }, [syncCart]);

  const removeItem = useCallback(itemId => {
    syncCart(previous => previous.filter(item => item.id !== itemId));
  }, [syncCart]);

  if (!isOpen) return null;

  return (
    <div
      className="Cart_root"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside className="Cart_panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="Cart_header">
          <div>
            <p className="Cart_eyebrow">Ваш выбор</p>
            <h2 id="cart-title" className="Cart_title">{isCheckout ? 'Оформление заказа' : 'Корзина'}</h2>
          </div>
          <button className="Cart_close" type="button" onClick={onClose} aria-label="Закрыть корзину">×</button>
        </header>

        {!isCheckout ? (
          <div className="Cart_scene">
            {cartItems.length === 0 ? (
              <div className="Cart_empty">
                <h3>Корзина пока пуста</h3>
                <p>Добавьте чай из коллекции, и он появится здесь.</p>
                <button type="button" onClick={onClose}>Вернуться к выбору</button>
              </div>
            ) : (
              <div className="Cart_items">
                {cartItems.map(item => (
                  <article key={item.id} className="Cart_item">
                    {item.image ? <img src={item.image} alt={item.name} className="Cart_itemImage" /> : null}
                    <div className="Cart_itemContent">
                      <div className="Cart_itemTop">
                        <h3 className="Cart_itemName">{item.name}</h3>
                        <button
                          className="Cart_delete"
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Удалить ${item.name}`}
                        >
                          <img src={DeleteIcon} alt="" />
                        </button>
                      </div>
                      <p className="Cart_itemDescription">{item.description}</p>
                      <div className="Cart_itemBottom">
                        <strong>{formatPrice(item.price)}</strong>
                        <div className="Cart_counter" aria-label={`Количество ${item.name}`}>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Уменьшить">−</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Увеличить">+</button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {cartItems.length > 0 ? (
              <div className="Cart_footerAction">
                <div className="Cart_total"><span>Итого</span><strong>{formatPrice(totalSum)}</strong></div>
                <button className="Cart_primary" type="button" onClick={() => setIsCheckout(true)}>
                  Оформить заказ
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <CheckoutForm
            cartItems={cartItems}
            totalSum={totalSum}
            onBack={() => setIsCheckout(false)}
          />
        )}
      </aside>
    </div>
  );
};

function CheckoutForm({ cartItems, totalSum, onBack }) {
  const [form, setForm] = useState(EMPTY_CHECKOUT);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = event => {
    const { name, value, type, checked } = event.target;
    setForm(previous => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (submitting) return;
    if (!/^\+?[0-9\s()-]{10,18}$/.test(form.phone || '')) {
      setStatus('Введите корректный номер телефона');
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const response = await fetch('/api/cart-form/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          cartItems: cartItems.map(({ id, name, quantity, price }) => ({ id, name, quantity, price })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus(data.message || 'Не удалось оформить заказ. Попробуйте позже.');
      } else {
        setStatus('Заказ принят. Мы свяжемся с вами для подтверждения.');
        setForm(EMPTY_CHECKOUT);
      }
    } catch {
      setStatus('Нет соединения с сервером. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="Cart_checkout" onSubmit={handleSubmit}>
      <button className="Cart_back" type="button" onClick={onBack}>← Назад к корзине</button>

      <div className="Cart_formGrid">
        <label className="Cart_field"><span>Имя</span><input name="name" value={form.name} onChange={onChange} autoComplete="given-name" required /></label>
        <label className="Cart_field"><span>Фамилия</span><input name="surname" value={form.surname} onChange={onChange} autoComplete="family-name" required /></label>
        <label className="Cart_field"><span>Телефон</span><input name="phone" type="tel" value={form.phone} onChange={onChange} autoComplete="tel" placeholder="+7 (___) ___-__-__" required /></label>
        <label className="Cart_field"><span>Электронная почта</span><input name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" placeholder="mail@example.ru" required /></label>
        <label className="Cart_field Cart_field--wide"><span>Адрес доставки</span><input name="address" value={form.address} onChange={onChange} autoComplete="street-address" required /></label>
        <label className="Cart_field Cart_field--wide">
          <span>Способ доставки</span>
          <select name="delivery" value={form.delivery} onChange={onChange} required>
            <option value="" disabled>Выберите способ</option>
            <option value="courier">Курьерская доставка</option>
            <option value="pickup">Самовывоз из чайного дома</option>
            <option value="transport">Транспортная компания</option>
          </select>
        </label>
      </div>

      <label className="Cart_consent">
        <input type="checkbox" name="agreedToTerms" checked={form.agreedToTerms} onChange={onChange} required />
        <span>Принимаю <a href={PERSONAL_DATA_POLICY_URL}>условия обработки персональных данных</a>.</span>
      </label>

      <div className="Cart_checkoutTotal"><span>К оплате</span><strong>{formatPrice(totalSum)}</strong></div>
      <button className="Cart_primary" type="submit" disabled={submitting}>{submitting ? 'Отправляем...' : 'Подтвердить заказ'}</button>
      {status ? <p className="Cart_status" role="status">{status}</p> : null}
    </form>
  );
}

export default Cart;
