// lib/actions/admin-couriers.ts
"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function canManage(session: any): boolean {
  return ["ADMIN", "MANAGER"].includes(session?.user?.role);
}

export async function addCourier(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!canManage(session)) return { error: "Недостаточно прав" };

  const userEmail = (formData.get("userEmail") as string)?.trim() || null;
  const phone     = (formData.get("phone") as string)?.trim();
  const vehicle   = (formData.get("vehicle") as string)?.trim() || null;
  const name      = (formData.get("name") as string)?.trim() || null;

  if (!phone) return { error: "Телефон обязателен" };

  try {
    if (userEmail) {
      // Link to existing platform user
      const user = await prisma.user.findUnique({ where: { email: userEmail } });
      if (!user) return { error: `Пользователь ${userEmail} не найден` };

      const existing = await prisma.courier.findUnique({ where: { userId: user.id } });
      if (existing) return { error: "У этого пользователя уже есть профиль курьера" };

      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { role: "COURIER" } }),
        prisma.courier.create({ data: { userId: user.id, phone, vehicle, name: user.name } }),
      ]);
    } else {
      // Add courier without a platform account (FIXED: userId is now optional in schema)
      if (!name) return { error: "Укажите имя или email пользователя" };
      await prisma.courier.create({ data: { phone, vehicle, name } });
    }

    revalidatePath("/admin/couriers");
    return { success: true };
  } catch (err) {
    console.error("addCourier error:", err);
    return { error: "Ошибка при добавлении курьера" };
  }
}
