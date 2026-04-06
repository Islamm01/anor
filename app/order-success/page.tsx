// app/order-success/page.tsx
// Anjir — Order confirmation page for guest orders
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = { title: "Заказ принят — Anjir" };

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderNumber = searchParams.order ?? "—";

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-5 pt-16 pb-16">
        <div className="max-w-md w-full text-center">

          {/* Success icon */}
          <div className="w-20 h-20 bg-[#1a472a]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-14 h-14 bg-[#1a472a] rounded-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-[30px] font-black text-black tracking-tight mb-2">
            Заказ принят!
          </h1>
          <p className="text-[14px] text-black/50 leading-relaxed mb-6">
            Ваш заказ успешно оформлен. Наш менеджер свяжется с вами в ближайшее время для подтверждения.
          </p>

          {/* Order number */}
          <div className="bg-[#f7f5f0] rounded-2xl px-6 py-5 mb-8 border border-black/5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-2">
              Номер вашего заказа
            </p>
            <p className="text-[22px] font-black font-mono text-[#1a472a] tracking-wider">
              {orderNumber}
            </p>
            <p className="text-[11px] text-black/35 mt-2">
              Сохраните этот номер для отслеживания заказа
            </p>
          </div>

          {/* Steps */}
          <div className="text-left space-y-3 mb-8">
            {[
              {
                emoji: "📱",
                title: "Подтверждение",
                desc: "Менеджер позвонит вам для подтверждения заказа",
              },
              {
                emoji: "📦",
                title: "Сборка",
                desc: "Мы подготовим ваш заказ к отправке",
              },
              {
                emoji: "🚚",
                title: "Доставка",
                desc: "Курьер доставит заказ по указанному адресу",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="flex items-start gap-3 px-4 py-3 bg-white rounded-xl border border-black/5"
              >
                <span className="text-xl mt-0.5">{step.emoji}</span>
                <div>
                  <p className="text-[13px] font-bold text-black">{step.title}</p>
                  <p className="text-[12px] text-black/40 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3.5 bg-[#1a472a] text-white text-[14px] font-bold rounded-xl hover:bg-[#0d2e1a] transition-colors text-center"
            >
              На главную
            </Link>
            <Link
              href="/catalog"
              className="flex-1 py-3.5 border border-black/12 text-black/60 text-[14px] font-medium rounded-xl hover:bg-black/4 transition-colors text-center"
            >
              Продолжить покупки
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
