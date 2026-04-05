// lib/actions/admin-suppliers.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function addSupplier(formData: FormData) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return { error: "Недостаточно прав" };
  }

  const companyName = (formData.get("companyName") as string)?.trim();
  const contactName = (formData.get("contactName") as string)?.trim();
  const phone       = (formData.get("phone") as string)?.trim();
  const region      = (formData.get("region") as string)?.trim();
  const address     = (formData.get("address") as string)?.trim() || null;
  const userEmail   = (formData.get("userEmail") as string)?.trim() || null;

  if (!companyName || !contactName || !phone || !region) {
    return { error: "Заполните все обязательные поля" };
  }

  try {
    // If email provided, link to existing user
    let userId: string | undefined;
    if (userEmail) {
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (!user) return { error: `Пользователь с email «${userEmail}» не найден` };

      // Check if user already has a supplier profile
      const existing = await prisma.supplier.findUnique({ where: { userId: user.id } });
      if (existing) return { error: "У этого пользователя уже есть профиль поставщика" };

      await prisma.user.update({ where: { id: user.id }, data: { role: "SUPPLIER" } });
      userId = user.id;
    }

    // FIXED: userId is now optional in schema — no placeholder needed
    await prisma.supplier.create({
      data: {
        companyName,
        contactName,
        phone,
        region,
        address,
        ...(userId ? { userId } : {}), // only set if we have a real user
      },
    });

    revalidatePath("/admin/suppliers");
    return { success: true };
  } catch (err: any) {
    console.error("addSupplier error:", err);
    return { error: "Ошибка при добавлении поставщика" };
  }
}
