// prisma/seed.ts — SARV Agro Platform seed data
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SARV Agro Platform...");

  const cats = await Promise.all([
    prisma.category.upsert({ where:{slug:"fruits"},       update:{}, create:{nameRu:"Фрукты",    nameTj:"Мева",         slug:"fruits",       sortOrder:1} }),
    prisma.category.upsert({ where:{slug:"vegetables"},   update:{}, create:{nameRu:"Овощи",     nameTj:"Сабзавот",     slug:"vegetables",   sortOrder:2} }),
    prisma.category.upsert({ where:{slug:"dried-fruits"}, update:{}, create:{nameRu:"Сухофрукты",nameTj:"Мевахои хушк", slug:"dried-fruits", sortOrder:3} }),
    prisma.category.upsert({ where:{slug:"nuts"},         update:{}, create:{nameRu:"Орехи",     nameTj:"Чормағз",      slug:"nuts",         sortOrder:4} }),
    prisma.category.upsert({ where:{slug:"herbs"},        update:{}, create:{nameRu:"Зелень",    nameTj:"Кабудӣ",       slug:"herbs",        sortOrder:5} }),
  ]);
  const [fruits, vegetables, dried, nuts, herbs] = cats;
  console.log("✅ Категории созданы");

  const products = [
    { nameRu:"Помидоры Хатлон",    nameTj:"Гӯҷабодиринги Хатлон", slug:"tomato-khatlon",
      descriptionRu:"Сочные мясистые помидоры из Хатлонской области.", descriptionTj:"Гӯҷабодирингҳои шарбатнок аз вилояти Хатлон.",
      pricePerKg:4.50,  minimumOrder:5,   categoryId:fruits.id,     originRegion:"Хатлон", stockQuantity:8000,  isFeatured:true,  isOrganic:true,  harvestSeason:"Июнь – Октябрь" },
    { nameRu:"Виноград Истаравшан", nameTj:"Ангури Истаравшан",    slug:"grape-istaravshan",
      descriptionRu:"Столовый виноград высшего класса из Истаравшана.",  descriptionTj:"Ангури суфраи дараҷаи аъло аз Истаравшан.",
      pricePerKg:12.00, minimumOrder:3,   categoryId:fruits.id,     originRegion:"Согд",   stockQuantity:3500,  isFeatured:true,  isOrganic:false, harvestSeason:"Август – Октябрь" },
    { nameRu:"Абрикосы Исфара",    nameTj:"Зардолуи Исфара",      slug:"apricot-isfara",
      descriptionRu:"Золотистые абрикосы из садов Исфары. Медовая сладость.",  descriptionTj:"Зардолуҳои тиллоранг аз боғҳои Исфара.",
      pricePerKg:8.50,  minimumOrder:3,   categoryId:fruits.id,     originRegion:"Согд",   stockQuantity:2000,  isFeatured:true,  isOrganic:true,  harvestSeason:"Июнь – Июль" },
    { nameRu:"Лук репчатый",       nameTj:"Пиёз",                 slug:"onion-tj",
      descriptionRu:"Крупный лук из Вахшской долины. Хранение до 8 месяцев.", descriptionTj:"Пиёзи калон аз водии Вахш. Нигоҳдорӣ то 8 моҳ.",
      pricePerKg:2.20,  minimumOrder:20,  categoryId:vegetables.id, originRegion:"РРП",    stockQuantity:15000, isFeatured:false, isOrganic:false, harvestSeason:"Июль – Сентябрь" },
    { nameRu:"Картофель горный",   nameTj:"Картошкаи кӯҳӣ",      slug:"potato-mountain",
      descriptionRu:"Рассыпчатый горный картофель с полей ГБАО.",  descriptionTj:"Картошкаи кӯҳии хӯбпазак аз ВМКБ.",
      pricePerKg:3.80,  minimumOrder:10,  categoryId:vegetables.id, originRegion:"ГБАО",   stockQuantity:6000,  isFeatured:false, isOrganic:true,  harvestSeason:"Август – Сентябрь" },
    { nameRu:"Курага (Исфара)",    nameTj:"Қайси (Исфара)",       slug:"dried-apricot-isfara",
      descriptionRu:"Натуральная курага без консервантов. Солнечная сушка.",  descriptionTj:"Қайсии табиӣ бе консервантҳо.",
      pricePerKg:28.00, minimumOrder:2,   categoryId:dried.id,      originRegion:"Согд",   stockQuantity:1500,  isFeatured:true,  isOrganic:true,  harvestSeason:"Июль – Август" },
    { nameRu:"Грецкий орех",       nameTj:"Чормағз",              slug:"walnut-tj",
      descriptionRu:"Крупный грецкий орех из горных садов Таджикистана.",  descriptionTj:"Чормағзи калон аз боғҳои кӯҳии Тоҷикистон.",
      pricePerKg:45.00, minimumOrder:1,   categoryId:nuts.id,       originRegion:"ГБАО",   stockQuantity:800,   isFeatured:false, isOrganic:true,  harvestSeason:"Сентябрь – Октябрь" },
    { nameRu:"Кинза свежая",       nameTj:"Гашнич",               slug:"cilantro-fresh",
      descriptionRu:"Ароматная свежая кинза из Хатлонских теплиц.",  descriptionTj:"Гашничи хушбӯй аз гармхонаҳои Хатлон.",
      pricePerKg:15.00, minimumOrder:0.5, categoryId:herbs.id,      originRegion:"Хатлон", stockQuantity:200,   isFeatured:false, isOrganic:true,  harvestSeason:"Круглый год" },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { pricePerKg: p.pricePerKg, stockQuantity: p.stockQuantity },
      create: { ...p, isActive: true, unit: "кг" },
    });
  }

  console.log(`✅ ${products.length} продуктов создано`);
  console.log("🌿 SARV Agro Platform — seed завершён!");
  console.log("\nСледующий шаг — стать администратором:");
  console.log('psql sarv_agro -c "UPDATE \\"User\\" SET role=\'ADMIN\' WHERE email=\'ваш@email.com\';"');
}

main().catch(console.error).finally(() => prisma.$disconnect());
