// components/layout/Footer.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/providers/LangProvider";
import { translations as T } from "@/lib/i18n";
import LangSwitcher from "@/components/ui/LangSwitcher";

export default function Footer() {
  const { lang } = useLang();
  const F = T.footer;
  const N = T.nav;

  return (
    <footer className="bg-[#0a1209] text-white mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#1a472a] rounded-xl flex items-center justify-center overflow-hidden">
                <Image src="/logo.png" alt="Anjir" width={32} height={32} className="object-contain scale-75" />
              </div>
             <div className="leading-none">
                <span className="font-black text-[18px] text-white leading-none block">Anjir</span>
                <span className="text-[9px] font-semibold text-white/30 tracking-[0.14em] uppercase leading-none block mt-0.5">Agro Platform</span>
              </div>
            </div>
            <p className="text-[13px] text-white/40 leading-relaxed max-w-xs">
              {lang === "ru"
                ? "Цифровая сельскохозяйственная платформа Таджикистана. Свежие продукты от фермеров напрямую к покупателям."
                : "Платформаи рақамии кишоварзии Тоҷикистон. Маҳсулоти тоза мустақиман аз деҳқонон ба харидорон."}
            </p>
            <div className="mt-5">
              <LangSwitcher dark />
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 mb-4">{F.platform[lang]}</p>
            <div className="flex flex-col gap-2.5">
              {[
                [N.catalog[lang], "/catalog"],
                [N.wholesale[lang], "/#wholesale"],
                [N.cart[lang], "/cart"],
              ].map(([l, h]) => (
                <Link key={h} href={h} className="text-[13px] text-white/45 hover:text-white transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 mb-4">{F.contact[lang]}</p>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-white/45">info@anjir.tj</p>
              <p className="text-[13px] text-white/45">+992 44 000 00 00</p>
              <p className="text-[13px] text-white/45">{F.address[lang]}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-white/25">
            © {new Date().getFullYear()} Anjir Agro Platform. {F.rights[lang]}.
          </p>
          <p className="text-[11px] text-white/15">
            {lang === "ru" ? "Таджикистан, регион Сугд" : "Тоҷикистон, вилояти Суғд"}
          </p>
        </div>
      </div>
    </footer>
  );
}
