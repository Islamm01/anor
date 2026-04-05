// components/catalog/CatalogSidebar.tsx
"use client";

import Link from "next/link";
import { useLang } from "@/components/providers/LangProvider";

interface Category {
  id: string;
  nameRu: string;
  nameTj: string;
  slug: string;
  _count?: { products: number };
}

const CAT_EMOJI: Record<string, string> = {
  fruits: "🍎", vegetables: "🥦", "dried-fruits": "🍇",
  nuts: "🌰", herbs: "🌿", grains: "🌾", default: "🌱",
};

export default function CatalogSidebar({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const { lang } = useLang();

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <div className="sticky top-24">
        <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-3 px-2">
          {lang === "ru" ? "Категории" : "Категорияҳо"}
        </p>
        <div className="space-y-0.5">
          <Link
            href="/catalog"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
              !activeSlug
                ? "bg-[#1a472a] text-white"
                : "text-black/50 hover:text-black hover:bg-black/5"
            }`}
          >
            <span>🌱</span>
            <span className="flex-1">{lang === "ru" ? "Все товары" : "Ҳамаи молҳо"}</span>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                activeSlug === cat.slug
                  ? "bg-[#1a472a] text-white"
                  : "text-black/50 hover:text-black hover:bg-black/5"
              }`}
            >
              <span>{CAT_EMOJI[cat.slug] ?? CAT_EMOJI.default}</span>
              <span className="flex-1 truncate">
                {lang === "ru" ? cat.nameRu : cat.nameTj}
              </span>
              {cat._count && (
                <span
                  className={`text-[10px] font-bold ${
                    activeSlug === cat.slug ? "text-white/50" : "text-black/25"
                  }`}
                >
                  {cat._count.products}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
