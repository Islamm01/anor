// components/catalog/ProductInfo.tsx
"use client";

import { Leaf, Package, MapPin, Calendar, Scale } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import AddToCartButton from "@/components/catalog/AddToCartButton";

interface Product {
  id: string;
  nameRu: string;
  nameTj: string;
  slug: string;
  descriptionRu: string;
  descriptionTj: string;
  pricePerKg: any;
  minimumOrder: any;
  maximumOrder?: any;
  unit: string;
  originRegion: string;
  stockQuantity: any;
  isOrganic: boolean;
  harvestSeason?: string | null;
  imageUrl?: string | null;
  category: { nameRu: string; nameTj: string };
}

export default function ProductInfo({ product }: { product: Product }) {
  const { lang } = useLang();

  const name        = lang === "tj" ? product.nameTj : product.nameRu;
  const description = lang === "tj" ? product.descriptionTj : product.descriptionRu;
  const catName     = lang === "tj" ? product.category.nameTj : product.category.nameRu;
  const price       = Number(product.pricePerKg);
  const minOrder    = Number(product.minimumOrder);
  const stock       = Number(product.stockQuantity);
  const inStock     = stock > 0;

  const facts = [
    { icon: MapPin,    label: lang === "ru" ? "Регион"    : "Минтақа",    value: product.originRegion },
    { icon: Scale,     label: lang === "ru" ? "Мин. заказ": "Ҳадди ақал", value: `${minOrder} ${product.unit}` },
    { icon: Package,   label: lang === "ru" ? "На складе" : "Дар анбор",  value: inStock ? `${stock.toFixed(0)} ${product.unit}` : (lang === "ru" ? "Нет в наличии" : "Мавҷуд нест") },
    ...(product.harvestSeason ? [{ icon: Calendar, label: lang === "ru" ? "Сезон" : "Мавсим", value: product.harvestSeason }] : []),
  ];

  return (
    <div>
      {/* Category & badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold bg-black/5 text-black/50 px-2.5 py-1 rounded-full">
          {catName}
        </span>
        {product.isOrganic && (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-[#1a472a]/8 text-[#1a472a] px-2.5 py-1 rounded-full">
            <Leaf size={10} /> Organic
          </span>
        )}
        {!inStock && (
          <span className="text-[11px] font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
            {lang === "ru" ? "Нет в наличии" : "Мавҷуд нест"}
          </span>
        )}
      </div>

      {/* Name */}
      <h1 className="text-[32px] font-black text-black tracking-tight leading-tight mb-3">
        {name}
      </h1>

      {/* Price */}
      <div className="mb-6">
        <span className="text-[42px] font-black text-[#1a472a] tracking-tight leading-none">
          {price.toFixed(2)}
        </span>
        <span className="text-[16px] text-black/35 ml-2">
          сомони / {product.unit}
        </span>
      </div>

      {/* Add to cart */}
      {inStock && (
        <div className="mb-8">
          <AddToCartButton
            productId={product.id}
            productName={product.nameRu}
            pricePerKg={price}
            unit={product.unit}
            imageUrl={product.imageUrl}
            initialQty={minOrder}
          />
          <p className="text-[12px] text-black/35 mt-2">
            {lang === "ru"
              ? "Вход не требуется — заказывайте как гость"
              : "Воридшавӣ лозим нест — ҳамчун меҳмон фармоиш диҳед"}
          </p>
        </div>
      )}

      {/* Facts grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[#f7f5f0] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon size={12} className="text-black/30" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">
                {label}
              </span>
            </div>
            <p className="text-[14px] font-bold text-black">{value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      <div>
        <h2 className="text-[14px] font-black text-black mb-3">
          {lang === "ru" ? "Описание" : "Тавсиф"}
        </h2>
        <p className="text-[14px] text-black/55 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
}
