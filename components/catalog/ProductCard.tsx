// components/catalog/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Check, Leaf } from "lucide-react";
import { addToGuestCart } from "@/lib/cart/guest-cart";
import { useLang } from "@/components/providers/LangProvider";

interface Product {
  id: string;
  nameRu: string;
  nameTj: string;
  slug: string;
  pricePerKg: any;
  unit: string;
  imageUrl?: string | null;
  originRegion: string;
  stockQuantity: any;
  isOrganic: boolean;
  isFeatured: boolean;
  category?: { nameRu: string };
}

export default function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { lang } = useLang();
  const [added, setAdded] = useState(false);

  const name = lang === "tj" ? product.nameTj : product.nameRu;
  const price = Number(product.pricePerKg);
  const inStock = Number(product.stockQuantity) > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!inStock) return;
    addToGuestCart({
      productId: product.id,
      productName: product.nameRu,
      pricePerKg: price,
      unit: product.unit,
      imageUrl: product.imageUrl,
      quantity: 1,
    });
    window.dispatchEvent(new Event("anjir:cart-updated"));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-white rounded-3xl overflow-hidden border border-black/5 hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative h-52 bg-[#f7f5f0] overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isOrganic && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[#1a472a] text-[10px] font-bold rounded-full shadow-sm">
              <Leaf size={9} /> Organic
            </span>
          )}
          {!inStock && (
            <span className="px-2.5 py-1 bg-black/70 text-white text-[10px] font-bold rounded-full">
              Нет в наличии
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {product.category && (
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/25 mb-1.5">
            {product.category.nameRu}
          </p>
        )}
        <h3 className="text-[16px] font-black text-black leading-tight mb-1 group-hover:text-[#1a472a] transition-colors">
          {name}
        </h3>
        <p className="text-[12px] text-black/35 mb-4">{product.originRegion}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[20px] font-black text-[#1a472a]">{price.toFixed(2)}</span>
            <span className="text-[11px] text-black/35 ml-1">сом/{product.unit}</span>
          </div>

          {inStock && (
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all ${
                added
                  ? "bg-green-500 text-white scale-95"
                  : "bg-[#1a472a]/10 text-[#1a472a] hover:bg-[#1a472a] hover:text-white"
              }`}
            >
              {added ? <><Check size={12} /> Добавлено</> : <><ShoppingCart size={12} /> В корзину</>}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
