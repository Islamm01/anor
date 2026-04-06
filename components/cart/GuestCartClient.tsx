// components/cart/GuestCartClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import {
  getGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  GuestCartItem,
} from "@/lib/cart/guest-cart";

export default function GuestCartClient() {
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(getGuestCart());
    setMounted(true);
  }, []);

  function notifyUpdate() {
    window.dispatchEvent(new Event("anjir:cart-updated"));
  }

  function changeQty(productId: string, delta: number) {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    const next = Math.max(0, item.quantity + delta);
    const updated = next === 0
      ? removeFromGuestCart(productId)
      : updateGuestCartItem(productId, next);
    setItems(updated);
    notifyUpdate();
  }

  function remove(productId: string) {
    const updated = removeFromGuestCart(productId);
    setItems(updated);
    notifyUpdate();
  }

  function clear() {
    clearGuestCart();
    setItems([]);
    notifyUpdate();
  }

  const total = items.reduce((s, i) => s + i.pricePerKg * i.quantity, 0);

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center text-black/25">
        Загрузка корзины…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-24 text-center">
        <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={24} className="text-black/25" />
        </div>
        <h2 className="text-[20px] font-black text-black mb-2">Корзина пуста</h2>
        <p className="text-[14px] text-black/40 mb-6">
          Добавьте продукты из каталога
        </p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a472a] text-white text-[14px] font-bold rounded-full hover:bg-[#0d2e1a] transition-colors"
        >
          Перейти в каталог
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[26px] font-black text-black">
          Корзина{" "}
          <span className="text-black/25 text-[18px] font-semibold">
            ({items.length})
          </span>
        </h1>
        <button
          onClick={clear}
          className="text-[12px] text-black/35 hover:text-red-500 transition-colors"
        >
          Очистить
        </button>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-4"
          >
            {/* Image */}
            <div className="w-14 h-14 bg-[#f7f5f0] rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-2xl">🌿</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-black truncate">
                {item.productName}
              </p>
              <p className="text-[12px] text-black/40">
                {item.pricePerKg.toFixed(2)} сом / {item.unit}
              </p>
            </div>

            {/* Qty controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeQty(item.productId, -1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="text-[14px] font-black w-8 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => changeQty(item.productId, 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/5 hover:bg-black/10 transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Item total */}
            <div className="text-right shrink-0 w-20">
              <p className="text-[14px] font-black text-[#1a472a]">
                {(item.pricePerKg * item.quantity).toFixed(2)}
              </p>
              <p className="text-[9px] text-black/25">сомони</p>
            </div>

            {/* Remove */}
            <button
              onClick={() => remove(item.productId)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-black/25 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-[#f7f5f0] rounded-2xl p-5 border border-black/5 mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[13px] text-black/50">Товары ({items.length} позиции)</span>
          <span className="text-[15px] font-black text-black">
            {total.toFixed(2)} сом.
          </span>
        </div>
        <div className="flex justify-between items-center text-[12px] text-black/35">
          <span>Доставка</span>
          <span>Уточняется менеджером</span>
        </div>
      </div>

      {/* Checkout CTA */}
      <Link
        href="/checkout"
        className="flex items-center justify-center gap-2 w-full py-4 bg-[#1a472a] text-white text-[15px] font-black rounded-2xl hover:bg-[#0d2e1a] transition-all hover:scale-[1.01] shadow-[0_4px_20px_rgba(26,71,42,0.3)]"
      >
        Оформить заказ
        <ArrowRight size={16} />
      </Link>

      <p className="text-center text-[11px] text-black/30 mt-3">
        Вход не требуется — заказывайте как гость
      </p>
    </div>
  );
}
