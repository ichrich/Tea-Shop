const STORAGE_KEY = 'cartItems';

export function getCartItems() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartItems(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cart:changed'));
  } catch {
  }
}

function announceAdded(product, quantity) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cart:item-added', {
    detail: {
      name: product?.name || 'Чай',
      quantity,
    },
  }));
}

export function setCartItems(items) {
  saveCartItems(items || []);
}

export function addToCart(product, qty = 1) {
  if (!product || !product.id) return;
  const safeQty = Math.max(1, Number(qty) || 1);
  const current = getCartItems();
  const idx = current.findIndex((i) => i.id === product.id);

  if (idx >= 0) {
    const updated = [...current];
    updated[idx] = {
      ...updated[idx],
      quantity: (updated[idx].quantity || 0) + safeQty,
    };
    saveCartItems(updated);
  } else {
    const newItem = {
      id: product.id,
      name: product.name || '-',
      price: Number(product.price) || 0,
      image: product.image || null,
      description: product.description || '-',
      stock: typeof product.quantity === 'number' ? product.quantity : null,
      quantity: safeQty,
    };
    saveCartItems([...current, newItem]);
  }

  announceAdded(product, safeQty);
}

