// components/layout/HeroSection.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/providers/LangProvider";
import { translations as T } from "@/lib/i18n";

export default function HeroSection() {
  const { lang } = useLang();
  const H = T.hero;
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#f7f5f0]">
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -right-48 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[#1a472a]/6" />
        <div className="absolute -right-64 top-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#1a472a]/4" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#1a472a]/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-gradient-to-tr from-[#c8a84b]/6 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center min-h-[80vh]">
          <div className={`transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 bg-[#1a472a]/8 rounded-full border border-[#1a472a]/12">
              <div className="w-4 h-4 relative overflow-hidden rounded">
                <Image src="/logo.png" alt="SARV" width={16} height={16} className="object-contain" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1a472a]">
                {H.badge[lang]}
              </span>
            </div>

            <h1 className="leading-[0.92] tracking-[-0.03em] mb-6">
              <span className="block font-black text-[clamp(3.5rem,10vw,7rem)] text-[#1a1a1a]">SARV</span>
              <span className="block font-black text-[clamp(2rem,5vw,3.5rem)] text-[#1a472a]">{H.title1[lang]}</span>
              <span className="block font-black text-[clamp(1.5rem,3.5vw,2.5rem)] text-[#c8a84b]">{H.title2[lang]}</span>
            </h1>

            <p className="text-[17px] text-black/50 leading-relaxed mb-10 max-w-[460px] font-light">
              {H.subtitle[lang]}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/catalog" className="px-7 py-3.5 bg-[#1a472a] text-white text-[14px] font-semibold rounded-full hover:bg-[#0d2e1a] transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(26,71,42,0.3)]">
                {H.cta_catalog[lang]}
              </Link>
              <Link href="/#wholesale" className="px-7 py-3.5 border border-black/15 text-black text-[14px] font-medium rounded-full hover:bg-black/4 transition-colors">
                {H.cta_wholesale[lang]}
              </Link>
            </div>

            <div className="flex gap-8 mt-12 pt-8 border-t border-black/8">
              {[["200+", H.stat_products[lang]], ["800+", H.stat_buyers[lang]], ["4", H.stat_regions[lang]]].map(([num, label]) => (
                <div key={label}>
                  <p className="text-[24px] font-black text-[#1a1a1a] tracking-tight">{num}</p>
                  <p className="text-[12px] text-black/35 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`hidden lg:block transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <div className="relative max-w-[380px] ml-auto">
              <div className="bg-white rounded-[28px] p-7 shadow-[0_20px_80px_rgba(26,71,42,0.12)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/30">
                      {lang === "ru" ? "Сегодня в наличии" : "Имрӯз мавҷуд аст"}
                    </p>
                    <p className="text-[18px] font-bold text-black mt-0.5">
                      {lang === "ru" ? "Свежие продукты" : "Маҳсулоти тоза"}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-[#0a1209] rounded-xl flex items-center justify-center overflow-hidden">
                    <Image src="/logo.png" alt="SARV" width={28} height={28} className="object-contain scale-[0.65]" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    { emoji: "🍅", ru: "Помидоры", tj: "Гӯҷабодиринг", price: "4.50", change: "+8%" },
                    { emoji: "🍇", ru: "Виноград",  tj: "Ангур",        price: "12.00", change: "+5%" },
                    { emoji: "🍑", ru: "Абрикосы",  tj: "Зардолу",      price: "8.50",  change: "+12%" },
                    { emoji: "🧅", ru: "Лук",        tj: "Пиёз",         price: "2.20",  change: "+2%" },
                  ].map((item) => (
                    <div key={item.ru} className="flex items-center justify-between p-3 bg-[#f7f5f0] rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.emoji}</span>
                        <p className="text-[13px] font-semibold">{lang === "ru" ? item.ru : item.tj}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold">{item.price} сом/кг</p>
                        <p className="text-[10px] text-[#1a472a] font-semibold">{item.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-5 -left-6 bg-[#1a472a] text-white px-5 py-3.5 rounded-2xl shadow-[0_8px_32px_rgba(26,71,42,0.4)]">
                <p className="text-[10px] font-medium text-white/55 mb-0.5">{H.today_orders[lang]}</p>
                <p className="text-[22px] font-black">34</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#c8a84b] text-white px-4 py-2 rounded-xl shadow-lg">
                <p className="text-[11px] font-bold">🚚 {lang === "ru" ? "Быстрая доставка" : "Расонидани зуд"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-25">
        <div className="w-5 h-8 rounded-full border-2 border-black/40 flex items-start justify-center pt-1">
          <div className="w-1 h-2 bg-black rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
