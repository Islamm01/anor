// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Truck,
  LogOut,
  ChevronRight,
} from "lucide-react";

function canAccessAdmin(session: any): boolean {
  const role = session?.user?.role;
  return ["ADMIN", "MANAGER", "SUPPLIER", "COURIER"].includes(role);
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!canAccessAdmin(session)) redirect("/");

  const role = (session?.user as any)?.role;
  const isAdmin = role === "ADMIN";
  const isAdminOrManager = isAdmin || role === "MANAGER";

  const nav = [
    { href: "/admin/dashboard", label: "Дашборд", icon: LayoutDashboard, show: isAdminOrManager },
    { href: "/admin/orders", label: "Заказы", icon: ShoppingBag, show: true },
    { href: "/admin/products", label: "Товары", icon: Package, show: isAdminOrManager },
    { href: "/admin/suppliers", label: "Поставщики", icon: Users, show: isAdmin },
    { href: "/admin/couriers", label: "Курьеры", icon: Truck, show: isAdminOrManager },
  ].filter((n) => n.show);

  return (
    <div className="min-h-screen bg-[#f4f2ed] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-black/8 flex flex-col shrink-0 fixed top-0 left-0 h-full z-30">
        {/* Brand */}
        <div className="px-4 py-4 border-b border-black/8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-[#0a1209] rounded-lg flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Anjir" width={28} height={28} className="object-contain scale-75" />
            </div>
            <div className="leading-none">
              <span className="text-[14px] font-black text-black leading-none block">Anjir</span>
              <span className="block text-[8px] text-black/30 uppercase tracking-[0.14em] mt-0.5">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Role badge */}
        <div className="px-4 py-2.5 border-b border-black/5 bg-[#f7f5f0]">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isAdmin
              ? "bg-[#1a472a]/10 text-[#1a472a]"
              : "bg-blue-50 text-blue-700"
          }`}>
            {role}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-black/45 hover:text-black hover:bg-stone-50 transition-colors group"
            >
              <Icon size={15} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              <ChevronRight size={10} className="opacity-0 group-hover:opacity-30 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2.5 py-3 border-t border-black/8 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-black/35 hover:text-black hover:bg-stone-50 transition-colors"
          >
            <LogOut size={15} strokeWidth={1.8} />
            На сайт
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">{children}</main>
    </div>
  );
}
