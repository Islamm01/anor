// components/checkout/GuestCheckoutForm.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, User, Phone, MapPin, MessageSquare, AlertCircle } from "lucide-react";
import {
  getGuestCart,
  clearGuestCart,
  GuestCartItem,
} from "@/lib/cart/guest-cart";
import { placeGuestOrder } from "@/lib/actions/guest-checkout";

export default function GuestCheckoutForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [cartItems, setCartItems] = useState<GuestCartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    notes: "",
  });

  useEffect(() => {
    const items = getGuestCart();
    if (items.length === 0) {
      router.replace("/cart");
    } else {
      setCartItems(items);
    }
  }, [router]);

  const total = cartItems.reduce(
    (sum, i) => sum + i.pricePerKg * i.quantity,
    0
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    data.set("customerName", form.customerName);
    data.set("customerPhone", form.customerPhone);
    data.set("deliveryAddress", form.deliveryAddress);
    data.set("notes", form.notes);
    data.set(
      "items",
      JSON.stringify(
        cartItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.pricePerKg,
          unit: i.unit,
        }))
      )
    );

    startTransition(async () => {
      const result = await placeGuestOrder(data);
      if (result.error) {
        setError(result.error);
      } else {
        clearGuestCart();
        window.dispatchEvent(new Event("anjir:cart-updated"));
        router.push(
          `/order-success?order=${result.orderNumber}`
        );
      }
    });
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center text-black/25 text-[15px]">
        Корзина пуста…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order summary */}
      <div className="bg-[#f7f5f0] rounded-2xl p-5 border border-black/5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-3 flex items-center gap-1.5">
          <ShoppingBag size={12} /> Ваш заказ
        </p>
        <div className="space-y-2">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between items-center text-[13px]"
            >
              <span className="text-black/70">
                {item.productName}{" "}
                <span className="text-black/35">
                  × {item.quantity} {item.unit}
                </span>
              </span>
              <span className="font-bold text-black">
                {(item.pricePerKg * item.quantity).toFixed(2)} сом.
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-black/8 flex justify-between items-center">
          <span className="text-[13px] font-semibold text-black/50">Итого</span>
          <span className="text-[18px] font-black text-[#1a472a]">
            {total.toFixed(2)} сомони
          </span>
        </div>
      </div>

      {/* Contact fields */}
      <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <p className="text-[12px] font-bold uppercase tracking-widest text-black/30">
            Данные получателя
          </p>
        </div>

        {/* Full name */}
        <div className="px-5 py-4 border-b border-black/5">
          <label className="flex items-center gap-2 text-[11px] font-semibold text-black/40 uppercase tracking-widest mb-2">
            <User size={11} /> ФИО
          </label>
          <input
            type="text"
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            placeholder="Акбар Рахимов"
            required
            minLength={2}
            className="w-full text-[14px] font-medium text-black placeholder:text-black/20 bg-transparent outline-none"
          />
        </div>

        {/* Phone */}
        <div className="px-5 py-4 border-b border-black/5">
          <label className="flex items-center gap-2 text-[11px] font-semibold text-black/40 uppercase tracking-widest mb-2">
            <Phone size={11} /> Номер телефона
          </label>
          <input
            type="tel"
            name="customerPhone"
            value={form.customerPhone}
            onChange={handleChange}
            placeholder="+992 93 123 4567"
            required
            className="w-full text-[14px] font-medium text-black placeholder:text-black/20 bg-transparent outline-none"
          />
        </div>

        {/* Address */}
        <div className="px-5 py-4 border-b border-black/5">
          <label className="flex items-center gap-2 text-[11px] font-semibold text-black/40 uppercase tracking-widest mb-2">
            <MapPin size={11} /> Адрес доставки
          </label>
          <input
            type="text"
            name="deliveryAddress"
            value={form.deliveryAddress}
            onChange={handleChange}
            placeholder="г. Худжанд, ул. Айни, д. 45"
            required
            minLength={5}
            className="w-full text-[14px] font-medium text-black placeholder:text-black/20 bg-transparent outline-none"
          />
        </div>

        {/* Comment */}
        <div className="px-5 py-4">
          <label className="flex items-center gap-2 text-[11px] font-semibold text-black/40 uppercase tracking-widest mb-2">
            <MessageSquare size={11} /> Комментарий{" "}
            <span className="normal-case text-[10px] text-black/25 tracking-normal">
              (необязательно)
            </span>
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Позвоните за 30 минут до доставки..."
            rows={2}
            className="w-full text-[14px] font-medium text-black placeholder:text-black/20 bg-transparent outline-none resize-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px] font-medium">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-4 bg-[#1a472a] text-white text-[15px] font-black rounded-2xl hover:bg-[#0d2e1a] transition-all hover:scale-[1.01] shadow-[0_4px_20px_rgba(26,71,42,0.3)] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Оформляем заказ…
          </>
        ) : (
          <>
            Оформить заказ — {total.toFixed(2)} сом.
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-black/30 leading-relaxed">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
        <br />
        Наш менеджер свяжется с вами для подтверждения заказа.
      </p>
    </form>
  );
}
