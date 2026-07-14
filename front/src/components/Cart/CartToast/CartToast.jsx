import { useEffect, useRef, useState } from 'react';
import './CartToast.css';

export function CartToast() {
  const [notice, setNotice] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const onAdded = event => {
      window.clearTimeout(timerRef.current);
      setNotice({
        id: Date.now(),
        name: event.detail?.name || 'Чай',
        quantity: event.detail?.quantity || 1,
      });
      timerRef.current = window.setTimeout(() => setNotice(null), 3200);
    };

    window.addEventListener('cart:item-added', onAdded);
    return () => {
      window.clearTimeout(timerRef.current);
      window.removeEventListener('cart:item-added', onAdded);
    };
  }, []);

  if (!notice) return null;

  return (
    <div className="CartToast" role="status" aria-live="polite">
      <span className="CartToast_mark" aria-hidden="true">✓</span>
      <span className="CartToast_copy">
        <strong>Добавлено в корзину</strong>
        <span>{notice.name}{notice.quantity > 1 ? `, ${notice.quantity} шт.` : ''}</span>
      </span>
    </div>
  );
}

export default CartToast;
