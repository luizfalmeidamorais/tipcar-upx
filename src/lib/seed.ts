import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Parceiro + rewards
  const partner = await prisma.partner.upsert({
    where: { id: "demo-partner" },
    update: {},
    create: { id: "demo-partner", name: "Lanchonete do Campus" },
  });
  await prisma.reward.createMany({
    data: [
      { partnerId: partner.id, name: "Desconto R$5", cost: 50, stock: 100 },
      { partnerId: partner.id, name: "Desconto R$10", cost: 90, stock: 50 },
    ],
  });
}

main().finally(() => prisma.$disconnect());
