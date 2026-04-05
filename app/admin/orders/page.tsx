// app/admin/orders/page.tsx
import prisma from "@/lib/prisma";
import { formatTJS } from "@/lib/i18n";
import Link from "next/link";
import OrderStatusButton from "@/components/admin/OrderStatusButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Заказы — SARV Admin" };

const TABS = [
  { label: "Все", value: "" },
  { label: "🆕 Новые", value: "NEW_ORDER" },
  { label: "✅ Принятые", value: "ACCEPTED" },
  { label: "🔄 Готовятся", value: "PREPARING" },
  { label: "📦 Готовы", value: "READY_FOR_DELIVERY" },
  { label: "🚚 Доставляются", value: "OUT_FOR_DELIVERY" },
  { label: "🎉 Доставлены", value: "DELIVERED" },
  { label: "❌ Отменены", value: "CANCELLED" },
];

const STATUS_COLOR: Record<string, string> = {
  NEW_ORDER:          "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED:           "bg-blue-50 text-blue-700 border-blue-200",
  PREPARING:          "bg-violet-50 text-violet-700 border-violet-200",
  READY_FOR_DELIVERY: "bg-orange-50 text-orange-700 border-orange-200",
  OUT_FOR_DELIVERY:   "bg-orange-100 text-orange-800 border-orange-300",
  DELIVERED:          "bg-green-50 text-green-700 border-green-200",
  CANCELLED:          "bg-red-50 text-red-600 border-red-200",
  // Legacy
  PENDING:    "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED:  "bg-blue-50 text-blue-700 border-blue-200",
  COLLECTING: "bg-violet-50 text-violet-700 border-violet-200",
  IN_DELIVERY:"bg-orange-50 text-orange-700 border-orange-200",
  COMPLETED:  "bg-green-50 text-green-700 border-green-200",
};

const STATUS_RU: Record<string, string> = {
  NEW_ORDER:          "Новый",
  ACCEPTED:           "Принят",
  PREPARING:          "Готовится",
  READY_FOR_DELIVERY: "Готов",
  OUT_FOR_DELIVERY:   "Доставляется",
  DELIVERED:          "Доставлен",
  CANCELLED:          "Отменён",
  PENDING:    "Ожидает",
  CONFIRMED:  "Подтверждён",
  COLLECTING: "Сборка",
  IN_DELIVERY:"В доставке",
  COMPLETED:  "Завершён",
};

const ORDER_TYPE_RU: Record<string, string> = {
  RETAIL: "Розничный",
  WHOLESALE: "Оптовый",
  BULK: "Крупный опт",
  INDUSTRIAL: "Промышленный",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const limit = 20;
  const where: any = {};
  if (searchParams.status) where.status = searchParams.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: { select: { productName: true, quantity: true, unit: true } },
        courier: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-black text-black">Заказы</h1>
        <p className="text-[13px] text-black/35 mt-0.5">{total} заказов</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/orders${tab.value ? `?status=${tab.value}` : ""}`}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
              (searchParams.status ?? "") === tab.value
                ? "bg-[#1a472a] text-white"
                : "bg-white text-black/45 border border-black/10 hover:text-black"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-black/5">
                {["Номер", "Клиент", "Товары", "Тип", "Сумма", "Статус", "Курьер", "Дата", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-black/25"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/4">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="text-[12px] font-black font-mono text-black">
                      {o.orderNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-[13px] font-semibold">{o.customerName}</p>
                    <p className="text-[11px] text-black/35">{o.customerPhone}</p>
                    {o.deliveryAddress && (
                      <p className="text-[10px] text-black/25 truncate max-w-[140px]">
                        {o.deliveryAddress}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-[12px] text-black/50">
                    {o.items.slice(0, 2).map((i) => (
                      <p key={i.productName} className="truncate max-w-[120px]">
                        {i.productName}{" "}
                        <span className="text-black/30">
                          {Number(i.quantity)}{i.unit}
                        </span>
                      </p>
                    ))}
                    {o.items.length > 2 && (
                      <p className="text-black/30">+{o.items.length - 2} ещё</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold bg-black/5 px-2 py-0.5 rounded-full text-black/55">
                      {ORDER_TYPE_RU[o.orderType] ?? o.orderType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-black text-[#1a472a]">
                      {formatTJS(Number(o.totalAmount))}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        STATUS_COLOR[o.status] ?? "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {STATUS_RU[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-black/40">
                    {o.courier?.user?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-[11px] text-black/35 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3.5">
                    <OrderStatusButton
                      orderId={o.id}
                      currentStatus={o.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!orders.length && (
          <div className="py-16 text-center text-[14px] text-black/25">
            Заказов нет
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?${searchParams.status ? `status=${searchParams.status}&` : ""}page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-bold transition-colors ${
                p === page
                  ? "bg-[#1a472a] text-white"
                  : "bg-white border border-black/10 text-black/45 hover:text-black"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
