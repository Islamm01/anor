// components/admin/OrderStatusButton.tsx
"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/lib/actions/admin-orders";
import { ChevronDown, Loader2 } from "lucide-react";

const TRANSITIONS: Record<string, Array<{ value: string; label: string }>> = {
  NEW_ORDER: [
    { value: "ACCEPTED", label: "✅ Принять" },
    { value: "CANCELLED", label: "❌ Отменить" },
  ],
  ACCEPTED: [
    { value: "PREPARING", label: "🔄 В сборку" },
    { value: "CANCELLED", label: "❌ Отменить" },
  ],
  PREPARING: [
    { value: "READY_FOR_DELIVERY", label: "📦 Готов" },
    { value: "CANCELLED", label: "❌ Отменить" },
  ],
  READY_FOR_DELIVERY: [
    { value: "OUT_FOR_DELIVERY", label: "🚚 Отправить" },
    { value: "CANCELLED", label: "❌ Отменить" },
  ],
  OUT_FOR_DELIVERY: [
    { value: "DELIVERED", label: "🎉 Доставлен" },
  ],
  DELIVERED: [],
  CANCELLED: [],
  // Legacy
  PENDING:    [{ value: "ACCEPTED", label: "✅ Принять" }, { value: "CANCELLED", label: "❌ Отменить" }],
  CONFIRMED:  [{ value: "PREPARING", label: "🔄 В сборку" }, { value: "CANCELLED", label: "❌ Отменить" }],
  COLLECTING: [{ value: "READY_FOR_DELIVERY", label: "📦 Готов" }],
  IN_DELIVERY:[{ value: "DELIVERED", label: "🎉 Доставлен" }],
  COMPLETED:  [],
};

export default function OrderStatusButton({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const options = TRANSITIONS[currentStatus] ?? [];

  if (options.length === 0) return null;

  function handleSelect(newStatus: string) {
    setOpen(false);
    startTransition(() => updateOrderStatus(orderId, newStatus));
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a472a]/8 text-[#1a472a] text-[11px] font-bold rounded-lg hover:bg-[#1a472a]/15 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <>
            Статус
            <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-black/8 shadow-xl z-20 overflow-hidden min-w-[160px]">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="w-full text-left px-3.5 py-2.5 text-[12px] font-semibold text-black/70 hover:bg-stone-50 hover:text-black transition-colors border-b border-black/4 last:border-0"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
