// components/admin/AddCourierForm.tsx
"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { addCourier } from "@/lib/actions/admin-couriers";

export default function AddCourierForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addCourier(data);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  const fieldClass = "w-full px-3 py-2 text-[13px] border border-black/10 rounded-xl bg-[#f9f8f6] focus:outline-none focus:border-[#1a472a]/30";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-black/30 mb-1";

  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-black/5">
        <h2 className="text-[14px] font-black text-black">Добавить курьера</h2>
        <p className="text-[11px] text-black/35 mt-0.5">
          Email необязателен — можно добавить без аккаунта
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
        <div>
          <label className={labelClass}>Имя *</label>
          <input type="text" name="name" placeholder="Акбар Рахимов" required className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Телефон *</label>
          <input type="tel" name="phone" placeholder="+992 93 000 0000" required className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Транспорт</label>
          <input type="text" name="vehicle" placeholder="Мотоцикл / Тойота Хайс" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>
            Email аккаунта{" "}
            <span className="normal-case text-[10px] text-black/25 tracking-normal font-normal">
              (для входа в систему)
            </span>
          </label>
          <input type="email" name="userEmail" placeholder="courier@example.com" className={fieldClass} />
        </div>

        {error && (
          <p className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}
        {success && (
          <div className="flex items-center gap-2 text-[12px] text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <CheckCircle size={13} /> Курьер добавлен!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-[#1a472a] text-white text-[13px] font-black rounded-xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : null}
          {isPending ? "Добавляем…" : "Добавить курьера"}
        </button>
      </form>
    </div>
  );
}
