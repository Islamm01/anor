// components/admin/AdminProductRow.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleProductStatus } from "@/lib/actions/products";
import { formatTJS } from "@/lib/i18n";

interface Product {
  id: string;
  nameRu: string;
  slug: string;
  pricePerKg: any;
  stockQuantity: any;
  isActive: boolean;
  isOrganic: boolean;
  unit: string;
  category: { nameRu: string };
}

export default function AdminProductRow({ product }: { product: Product }) {
  const [active, setActive] = useState(product.isActive);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !active;
    setActive(next);
    startTransition(() => toggleProductStatus(product.id, next));
  }

  const stock = Number(product.stockQuantity);

  return (
    <tr className="hover:bg-stone-50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          {product.isOrganic && (
            <span className="text-[9px] font-bold bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
              Org
            </span>
          )}
          <span className="text-[13px] font-semibold text-black">{product.nameRu}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[11px] font-bold bg-black/5 text-black/55 px-2.5 py-0.5 rounded-full">
          {product.category.nameRu}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] font-black text-[#1a472a]">
          {formatTJS(Number(product.pricePerKg))}
        </span>
        <span className="text-[10px] text-black/30 ml-1">/{product.unit}</span>
      </td>
      <td className="px-5 py-3.5">
        <span
          className={`text-[12px] font-black px-2.5 py-0.5 rounded-full ${
            stock < 20
              ? "bg-red-50 text-red-600"
              : stock < 100
              ? "bg-amber-50 text-amber-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {stock.toFixed(0)} {product.unit}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
            active
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          {active ? "Активен" : "Скрыт"}
        </button>
      </td>
      <td className="px-5 py-3.5">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="text-[12px] font-semibold text-[#1a472a] hover:underline"
        >
          Изменить →
        </Link>
      </td>
    </tr>
  );
}
