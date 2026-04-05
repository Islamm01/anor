// app/admin/couriers/page.tsx
import prisma from "@/lib/prisma";
import { Truck } from "lucide-react";
import AddCourierForm from "@/components/admin/AddCourierForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Курьеры — SARV Admin" };

export default async function CouriersPage() {
  const couriers = await prisma.courier.findMany({
    include: {
      user: { select: { name: true, email: true } },
      orders: {
        where: { status: { in: ["OUT_FOR_DELIVERY", "READY_FOR_DELIVERY"] } },
        select: { orderNumber: true, customerName: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[26px] font-black text-black">Курьеры</h1>
        <p className="text-[13px] text-black/35 mt-0.5">{couriers.length} курьеров</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courier list */}
        <div className="lg:col-span-2 space-y-3">
          {couriers.map((c) => {
            // Support both: couriers linked to a user account AND standalone couriers
            const displayName = c.name ?? c.user?.name ?? "Без имени";
            const displayEmail = c.user?.email ?? null;

            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-black/5 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[15px] font-black text-black">{displayName}</p>
                    <p className="text-[12px] text-black/45 mt-0.5">
                      {c.phone}
                      {c.vehicle && (
                        <span className="ml-2 text-black/30">· {c.vehicle}</span>
                      )}
                    </p>
                    {displayEmail && (
                      <p className="text-[10px] text-black/25 mt-0.5">{displayEmail}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        c.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {c.isActive ? "Активен" : "Неактивен"}
                    </span>
                    {c.orders.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                        {c.orders.length} в доставке
                      </span>
                    )}
                  </div>
                </div>

                {/* Active deliveries */}
                {c.orders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-black/5 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/25 mb-2">
                      Текущие доставки
                    </p>
                    {c.orders.map((o) => (
                      <div
                        key={o.orderNumber}
                        className="flex items-center justify-between text-[12px]"
                      >
                        <span className="font-mono font-bold text-black/60">
                          {o.orderNumber}
                        </span>
                        <span className="text-black/40">{o.customerName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {!couriers.length && (
            <div className="bg-white rounded-2xl border border-black/5 py-16 text-center">
              <Truck size={32} className="mx-auto text-black/15 mb-3" />
              <p className="text-[14px] text-black/25">Курьеры не добавлены</p>
            </div>
          )}
        </div>

        {/* Add courier form */}
        <div>
          <AddCourierForm />
        </div>
      </div>
    </div>
  );
}
