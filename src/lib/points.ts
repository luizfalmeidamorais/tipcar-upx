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

/**
 * Remove pontos de um usuário (insere delta negativo no ledger)
 * Exemplo:
 *   await removePoints(userId, 20, "Cancelou carona", rideId)
 */
export async function removePoints(
  userId: string,
  delta: number,
  reason: string,
  rideId?: string
) {
  // delta deve ser positivo. A função transforma para negativo.
  const negativeDelta = -Math.abs(delta);

  await prisma.$transaction(async (tx) => {
    // Decrementa pontos
    await tx.user.update({
      where: { id: userId },
      data: { points: { increment: negativeDelta } },
    });

    // Registra no ledger
    await tx.pointsLedger.create({
      data: {
        userId,
        delta: negativeDelta,
        reason,
        rideId,
      },
    });
  });
}