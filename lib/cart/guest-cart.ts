// lib/cart/guest-cart.ts
// Client-side cart for guest users using localStorage

export interface GuestCartItem {
  productId: string;
  productName: string;
  productNameTj?: string;
  pricePerKg: number;
  unit: string;
  imageUrl?: string | null;
  quantity: number;
}

const CART_KEY = "anjir_guest_cart";

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToGuestCart(item: GuestCartItem): GuestCartItem[] {
  const cart = getGuestCart();
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveGuestCart(cart);
  return cart;
}

export function updateGuestCartItem(productId: string, quantity: number): GuestCartItem[] {
  const cart = getGuestCart();
  const idx = cart.findIndex((i) => i.productId === productId);
  if (idx >= 0) {
    if (quantity <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = quantity;
    }
  }
  saveGuestCart(cart);
  return cart;
}

export function removeFromGuestCart(productId: string): GuestCartItem[] {
  const cart = getGuestCart().filter((i) => i.productId !== productId);
  saveGuestCart(cart);
  return cart;
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getGuestCartCount(): number {
  return getGuestCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function getGuestCartTotal(): number {
  return getGuestCart().reduce((sum, i) => sum + i.pricePerKg * i.quantity, 0);
}
