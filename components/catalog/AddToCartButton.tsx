// components/catalog/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { addToGuestCart } from "@/lib/cart/guest-cart";

interface Props {
  productId: string;
  productName: string;
  pricePerKg: number;
  unit: string;
  imageUrl?: string | null;
  initialQty?: number;
}

export default function AddToCartButton({
  productId,
  productName,
  pricePerKg,
  unit,
  imageUrl,
  initialQty = 1,
}: Props) {
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(initialQty);

  function handleAdd() {
    addToGuestCart({
      productId,
      productName,
      pricePerKg,
      unit,
      imageUrl,
      quantity: qty,
    });
    // Notify Navbar to update cart count
    window.dispatchEvent(new Event("sarv:cart-updated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      {/* Qty selector */}
      <div className="flex items-center border border-black/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-black/40 hover:text-black hover:bg-black/4 transition-colors text-[14px] font-bold"
        >
          −
        </button>
        <span className="px-3 py-2 text-[14px] font-bold text-black min-w-[2.5rem] text-center">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="px-3 py-2 text-black/40 hover:text-black hover:bg-black/4 transition-colors text-[14px] font-bold"
        >
          +
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={handleAdd}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
          added
            ? "bg-green-500 text-white scale-95"
            : "bg-[#1a472a] text-white hover:bg-[#0d2e1a] hover:scale-[1.02]"
        }`}
      >
        {added ? (
          <>
            <Check size={14} />
            Добавлено
          </>
        ) : (
          <>
            <ShoppingCart size={14} />
            В корзину
          </>
        )}
      </button>
    </div>
  );
}
