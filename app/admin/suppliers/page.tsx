// app/admin/suppliers/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, Plus } from "lucide-react";
import AddSupplierForm from "@/components/admin/AddSupplierForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Поставщики — SARV Admin" };

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      user: { select: { email: true } },
      products: { include: { product: { select: { nameRu: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-black text-black">Поставщики</h1>
          <p className="text-[13px] text-black/35 mt-0.5">{suppliers.length} поставщиков</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier list */}
        <div className="lg:col-span-2 space-y-3">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-black/5 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[15px] font-black text-black">{s.companyName}</p>
                  <p className="text-[12px] text-black/45 mt-0.5">
                    {s.contactName} · {s.phone}
                  </p>
                  <p className="text-[11px] text-black/30 mt-0.5">{s.region}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    s.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {s.isActive ? "Активен" : "Неактивен"}
                </span>
              </div>

              {s.products.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {s.products.map((sp) => (
                    <span
                      key={sp.id}
                      className="text-[10px] font-semibold bg-[#1a472a]/8 text-[#1a472a] px-2 py-0.5 rounded-full"
                    >
                      {sp.product.nameRu}
                    </span>
                  ))}
                </div>
              )}

              {s.user && (
                <p className="text-[10px] text-black/25 mt-2">{s.user.email}</p>
              )}
            </div>
          ))}

          {!suppliers.length && (
            <div className="bg-white rounded-2xl border border-black/5 py-16 text-center">
              <Users size={32} className="mx-auto text-black/15 mb-3" />
              <p className="text-[14px] text-black/25">Поставщики не добавлены</p>
            </div>
          )}
        </div>

        {/* Add supplier form */}
        <div>
          <AddSupplierForm />
        </div>
      </div>
    </div>
  );
}
