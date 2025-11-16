import prisma from "./prisma";

export async function addPoints(
  userId: string,
  delta: number,
  reason: string,
  rideId?: string
) {
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { points: { increment: delta } },
    });
    await tx.pointsLedger.create({ data: { userId, delta, reason, rideId } });
  });
}
