// components/cart/OrderDetailClient.tsx
"use client";

import Link from "next/link";
import { CheckCircle, Package, Truck, Clock, XCircle, MapPin, Phone, User } from "lucide-react";
import { useLang } from "@/components/providers/LangProvider";
import { formatTJS } from "@/lib/i18n";

const STATUS_STEPS = [
  "NEW_ORDER", "ACCEPTED", "PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "DELIVERED",
];

const STATUS_LABEL: Record<string, { ru: string; tj: string; icon: any }> = {
  NEW_ORDER:          { ru: "Новый заказ",       tj: "Фармоиши нав",       icon: Clock },
  ACCEPTED:           { ru: "Принят",            tj: "Қабул шуд",          icon: CheckCircle },
  PREPARING:          { ru: "Готовится",          tj: "Тайёр карда мешавад",icon: Package },
  READY_FOR_DELIVERY: { ru: "Готов к доставке",  tj: "Барои расонидан омода",icon: Package },
  OUT_FOR_DELIVERY:   { ru: "Доставляется",       tj: "Расонида мешавад",   icon: Truck },
  DELIVERED:          { ru: "Доставлен",          tj: "Расонида шуд",       icon: CheckCircle },
  CANCELLED:          { ru: "Отменён",            tj: "Бекор карда шуд",    icon: XCircle },
  // legacy
  PENDING:    { ru: "Ожидает",    tj: "Дар интизор",   icon: Clock },
  CONFIRMED:  { ru: "Подтверждён",tj: "Тасдиқшуда",    icon: CheckCircle },
  COLLECTING: { ru: "Сборка",     tj: "Ҷамъоварӣ",     icon: Package },
  IN_DELIVERY:{ ru: "В доставке", tj: "Дар расонидан", icon: Truck },
  COMPLETED:  { ru: "Завершён",   tj: "Иҷрошуда",      icon: CheckCircle },
};

export default function OrderDetailClient({
  order,
  isNew,
}: {
  order: any;
  isNew: boolean;
}) {
  const { lang } = useLang();
  const status = order.status;
  const isCancelled = status === "CANCELLED";
  const isDelivered = status === "DELIVERED" || status === "COMPLETED";
  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      {/* Success banner for new orders */}
      {isNew && (
        <div className="bg-[#1a472a] text-white rounded-3xl p-8 text-center mb-8 shadow-[0_8px_40px_rgba(26,71,42,0.3)]">
          <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} />
          </div>
          <h1 className="text-[24px] font-black mb-2">
            {lang === "ru" ? "Заказ принят!" : "Фармоиш қабул шуд!"}
          </h1>
          <p className="text-white/70 text-[14px]">
            {lang === "ru"
              ? "Менеджер свяжется с вами в ближайшее время"
              : "Менеҷер дар наздикии вақт бо шумо тамос мегирад"}
          </p>
        </div>
      )}

      {/* Order number */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">
            {lang === "ru" ? "Заказ" : "Фармоиш"}
          </p>
          <p className="text-[22px] font-black font-mono text-black">{order.orderNumber}</p>
        </div>
        <span className={`text-[12px] font-bold px-3 py-1.5 rounded-full ${
          isCancelled  ? "bg-red-50 text-red-600" :
          isDelivered  ? "bg-green-50 text-green-700" :
                         "bg-amber-50 text-amber-700"
        }`}>
          {STATUS_LABEL[status]?.[lang] ?? status}
        </span>
      </div>

      {/* Progress tracker (not shown for cancelled) */}
      {!isCancelled && (
        <div className="bg-[#f7f5f0] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between relative">
            {/* Track line */}
            <div className="absolute left-4 right-4 top-4 h-0.5 bg-black/8 z-0" />
            <div
              className="absolute left-4 top-4 h-0.5 bg-[#1a472a] z-0 transition-all"
              style={{ width: currentStep <= 0 ? "0%" : `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
            />

            {STATUS_STEPS.map((s, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <div key={s} className="flex flex-col items-center z-10 gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    done ? "bg-[#1a472a] text-white" : "bg-white border-2 border-black/10 text-black/20"
                  } ${active ? "ring-2 ring-[#1a472a]/30 scale-110" : ""}`}>
                    {i < currentStep ? (
                      <CheckCircle size={14} />
                    ) : (
                      <span className="text-[10px] font-black">{i + 1}</span>
                    )}
                  </div>
                  <p className={`text-[9px] font-bold text-center max-w-[60px] leading-tight ${done ? "text-[#1a472a]" : "text-black/25"}`}>
                    {STATUS_LABEL[s]?.[lang]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer info */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-black/5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">
            {lang === "ru" ? "Получатель" : "Гиранда"}
          </p>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          <div className="flex items-center gap-2 text-[13px]">
            <User size={13} className="text-black/25" />
            <span className="font-semibold">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <Phone size={13} className="text-black/25" />
            <span className="text-black/60">{order.customerPhone}</span>
          </div>
          {order.deliveryAddress && (
            <div className="flex items-center gap-2 text-[13px]">
              <MapPin size={13} className="text-black/25" />
              <span className="text-black/60">{order.deliveryAddress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-black/5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">
            {lang === "ru" ? "Состав заказа" : "Таркиби фармоиш"}
          </p>
        </div>
        <div className="divide-y divide-black/4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-[14px] font-semibold text-black">{item.productName}</p>
                <p className="text-[12px] text-black/35">
                  {Number(item.quantity)} {item.unit} × {formatTJS(Number(item.unitPrice))} сом.
                </p>
              </div>
              <p className="text-[14px] font-black text-[#1a472a]">
                {formatTJS(Number(item.totalPrice))} сом.
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center px-5 py-4 bg-[#f7f5f0] border-t border-black/5">
          <span className="text-[13px] font-semibold text-black/50">
            {lang === "ru" ? "Итого" : "Ҷамъ"}
          </span>
          <span className="text-[20px] font-black text-[#1a472a]">
            {formatTJS(Number(order.totalAmount))} сом.
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/60 mb-1">
            {lang === "ru" ? "Комментарий" : "Шарҳ"}
          </p>
          <p className="text-[13px] text-amber-800">{order.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/catalog"
          className="flex-1 py-3.5 bg-[#1a472a] text-white text-[14px] font-bold rounded-2xl text-center hover:bg-[#0d2e1a] transition-colors"
        >
          {lang === "ru" ? "Продолжить покупки" : "Харидро давом додан"}
        </Link>
        <Link
          href="/"
          className="px-6 py-3.5 border border-black/10 text-black/50 text-[14px] font-medium rounded-2xl hover:bg-black/4 transition-colors text-center"
        >
          {lang === "ru" ? "На главную" : "Асосӣ"}
        </Link>
      </div>
    </div>
  );
}
