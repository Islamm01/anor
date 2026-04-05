// components/admin/AdminProductForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createProduct } from "@/lib/actions/admin-products";

interface Category {
  id: string;
  nameRu: string;
}

export default function AdminProductForm({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createProduct(data);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/products");
      }
    });
  }

  const fieldClass =
    "w-full px-3.5 py-2.5 text-[13px] border border-black/10 rounded-xl bg-[#f9f8f6] focus:outline-none focus:border-[#1a472a]/40 focus:bg-white transition-colors";
  const labelClass =
    "block text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Название (RU) *</label>
          <input name="nameRu" required placeholder="Помидоры Хатлон" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Название (TJ) *</label>
          <input name="nameTj" required placeholder="Гӯҷабодиринги Хатлон" className={fieldClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Описание (RU) *</label>
        <textarea name="descriptionRu" required rows={3} placeholder="Сочные, мясистые помидоры…" className={fieldClass} />
      </div>

      <div>
        <label className={labelClass}>Описание (TJ) *</label>
        <textarea name="descriptionTj" required rows={3} placeholder="Гӯҷабодирингҳои шарбатнок…" className={fieldClass} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Цена за кг (TJS) *</label>
          <input name="pricePerKg" type="number" step="0.01" min="0" required placeholder="4.50" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Мин. заказ (кг)</label>
          <input name="minimumOrder" type="number" step="0.5" min="0.5" defaultValue="1" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>На складе (кг) *</label>
          <input name="stockQuantity" type="number" step="1" min="0" required placeholder="500" className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Категория *</label>
          <select name="categoryId" required className={fieldClass}>
            <option value="">— Выберите —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameRu}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Регион происхождения *</label>
          <input name="originRegion" required placeholder="Согд, Хатлон, РРП, ГБАО" className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Единица измерения</label>
          <select name="unit" className={fieldClass}>
            <option value="кг">кг</option>
            <option value="г">г</option>
            <option value="шт">шт</option>
            <option value="л">л</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Сезон урожая</label>
          <input name="harvestSeason" placeholder="Июнь – Октябрь" className={fieldClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>URL изображения</label>
        <input name="imageUrl" type="url" placeholder="https://…" className={fieldClass} />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isFeatured" value="true" className="w-4 h-4 accent-[#1a472a]" />
          <span className="text-[13px] font-medium text-black/60">Показать на главной</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="isOrganic" value="true" className="w-4 h-4 accent-[#1a472a]" />
          <span className="text-[13px] font-medium text-black/60">Органический</span>
        </label>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-[13px]">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-3 bg-[#1a472a] text-white text-[13px] font-black rounded-xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : null}
          {isPending ? "Сохраняем…" : "Добавить товар"}
        </button>
        <a
          href="/admin/products"
          className="px-6 py-3 border border-black/10 text-black/50 text-[13px] font-medium rounded-xl hover:bg-black/4 transition-colors text-center"
        >
          Отмена
        </a>
      </div>
    </form>
  );
}
