// components/admin/AddSupplierForm.tsx
"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { addSupplier } from "@/lib/actions/admin-suppliers";

export default function AddSupplierForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addSupplier(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  const fields = [
    { name: "companyName", label: "Название компании", placeholder: "ООО АгроСогд", required: true },
    { name: "contactName", label: "Контактное лицо", placeholder: "Акбар Рахимов", required: true },
    { name: "phone", label: "Телефон", placeholder: "+992 93 123 4567", required: true },
    { name: "region", label: "Регион", placeholder: "Сугд", required: true },
    { name: "address", label: "Адрес", placeholder: "г. Худжанд, ул. Айни 1", required: false },
    { name: "userEmail", label: "Email пользователя (для входа)", placeholder: "supplier@example.com", required: false },
  ];

  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-black/5">
        <h2 className="text-[14px] font-black text-black">Добавить поставщика</h2>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1">
              {f.label} {f.required && <span className="text-red-400">*</span>}
            </label>
            <input
              type="text"
              name={f.name}
              placeholder={f.placeholder}
              required={f.required}
              className="w-full px-3 py-2 text-[13px] border border-black/10 rounded-xl bg-[#f9f8f6] focus:outline-none focus:border-[#1a472a]/30"
            />
          </div>
        ))}

        {error && (
          <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-[12px] text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle size={13} />
            Поставщик добавлен!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-[#1a472a] text-white text-[13px] font-black rounded-xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
          {isPending ? "Добавляем…" : "Добавить поставщика"}
        </button>
      </form>
    </div>
  );
}
