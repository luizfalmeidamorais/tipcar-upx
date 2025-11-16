"use server";

import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

export async function redeem(rewardId: string) {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) throw new Error("Login");

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
  if (!reward || reward.stock <= 0) throw new Error("Indisponível");

  const me = await prisma.user.findUnique({ where: { id: user.id } });
  if (!me || me.points < reward.cost) throw new Error("Pontos insuficientes");

  const code = Math.random().toString(36).slice(2, 8).toUpperCase();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { points: { decrement: reward.cost } },
    });

    await tx.reward.update({
      where: { id: reward.id },
      data: { stock: { decrement: 1 } },
    });

    await tx.redemption.create({
      data: { userId: user.id, rewardId: reward.id, code },
    });
  });

  return { ok: true, code };
}
