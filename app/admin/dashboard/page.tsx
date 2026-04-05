// app/admin/dashboard/page.tsx
import prisma from "@/lib/prisma";
import { formatTJS } from "@/lib/i18n";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Дашборд — SARV Admin" };

const STATUS_COLOR: Record<string, string> = {
  NEW_ORDER:          "bg-amber-50 text-amber-700",
  ACCEPTED:           "bg-blue-50 text-blue-700",
  PREPARING:          "bg-violet-50 text-violet-700",
  READY_FOR_DELIVERY: "bg-orange-50 text-orange-700",
  OUT_FOR_DELIVERY:   "bg-orange-50 text-orange-700",
  DELIVERED:          "bg-green-50 text-green-700",
  CANCELLED:          "bg-red-50 text-red-600",
  // Legacy
  PENDING:    "bg-amber-50 text-amber-700",
  CONFIRMED:  "bg-blue-50 text-blue-700",
  COLLECTING: "bg-violet-50 text-violet-700",
  IN_DELIVERY:"bg-orange-50 text-orange-700",
  COMPLETED:  "bg-green-50 text-green-700",
};

const STATUS_RU: Record<string, string> = {
  NEW_ORDER:          "Новый",
  ACCEPTED:           "Принят",
  PREPARING:          "Готовится",
  READY_FOR_DELIVERY: "Готов к доставке",
  OUT_FOR_DELIVERY:   "Доставляется",
  DELIVERED:          "Доставлен",
  CANCELLED:          "Отменён",
  PENDING:    "Ожидает",
  CONFIRMED:  "Подтверждён",
  COLLECTING: "Сборка",
  IN_DELIVERY:"В доставке",
  COMPLETED:  "Завершён",
};

export default async function AdminDashboard() {
  const [
    totalOrders,
    newOrders,
    inProgress,
    delivered,
    revenue,
    activeProducts,
    suppliersCount,
    couriersCount,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ["NEW_ORDER", "PENDING"] } } }),
    prisma.order.count({
      where: {
        status: { in: ["ACCEPTED", "PREPARING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY", "CONFIRMED", "COLLECTING", "IN_DELIVERY"] },
      },
    }),
    prisma.order.count({ where: { status: { in: ["DELIVERED", "COMPLETED"] } } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["DELIVERED", "COMPLETED"] } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.courier.count({ where: { isActive: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: { select: { productName: true, quantity: true } } },
    }),
    prisma.product.findMany({
      where: { isActive: true, stockQuantity: { lt: 100 } },
      orderBy: { stockQuantity: "asc" },
      take: 6,
    }),
  ]);

  const stats = [
    {
      label: "Всего заказов",
      value: totalOrders,
      note: `${newOrders} новых`,
      urgent: newOrders > 0,
      href: "/admin/orders",
    },
    {
      label: "В обработке",
      value: inProgress,
      note: "активных заказов",
      href: "/admin/orders?status=ACCEPTED",
    },
    {
      label: "Доставлено",
      value: delivered,
      note: "завершённых",
      href: "/admin/orders?status=DELIVERED",
    },
    {
      label: "Выручка",
      value: formatTJS(Number(revenue._sum.totalAmount ?? 0)),
      note: "по доставленным",
    },
    {
      label: "Товаров",
      value: activeProducts,
      note: "в каталоге",
      href: "/admin/products",
    },
    {
      label: "Поставщики",
      value: suppliersCount,
      note: "активных",
      href: "/admin/suppliers",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-black text-black tracking-tight">Дашборд</h1>
        <p className="text-[13px] text-black/35 mt-0.5">
          SARV Agro Platform — панель управления
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
        {stats.map((s) => {
          const card = (
            <div
              className={`bg-white rounded-2xl p-4 border transition-shadow hover:shadow-sm ${
                s.urgent ? "border-amber-200 bg-amber-50" : "border-black/5"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mb-2 leading-tight">
                {s.label}
              </p>
              <p
                className={`text-[24px] font-black tracking-tight ${
                  s.urgent ? "text-amber-700" : "text-black"
                }`}
              >
                {s.value}
              </p>
              <p className="text-[10px] text-black/30 mt-0.5">{s.note}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>
              {card}
            </Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
            <h2 className="text-[14px] font-black">Последние заказы</h2>
            <Link href="/admin/orders" className="text-[12px] text-[#1a472a] font-semibold hover:underline">
              Все →
            </Link>
          </div>
          <div className="divide-y divide-black/4">
            {recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-stone-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-[12px] font-black font-mono text-black truncate">
                    {o.orderNumber}
                  </p>
                  <p className="text-[11px] text-black/35 truncate">
                    {o.customerName} · {o.customerPhone}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      STATUS_COLOR[o.status] ?? "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {STATUS_RU[o.status] ?? o.status}
                  </span>
                  <span className="text-[12px] font-black text-[#1a472a]">
                    {formatTJS(Number(o.totalAmount))}
                  </span>
                </div>
              </div>
            ))}
            {!recentOrders.length && (
              <div className="px-6 py-10 text-center text-[13px] text-black/25">
                Заказов пока нет
              </div>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
            <h2 className="text-[14px] font-black">Мало на складе</h2>
            <Link href="/admin/products" className="text-[12px] text-[#1a472a] font-semibold hover:underline">
              Управлять →
            </Link>
          </div>
          <div className="divide-y divide-black/4">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-3.5">
                <p className="text-[13px] font-semibold text-black truncate max-w-[120px]">
                  {p.nameRu}
                </p>
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                    Number(p.stockQuantity) < 20
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {Number(p.stockQuantity).toFixed(0)} кг
                </span>
              </div>
            ))}
            {!lowStock.length && (
              <div className="px-6 py-10 text-center text-[12px] text-black/25">
                Все товары в наличии ✅
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
