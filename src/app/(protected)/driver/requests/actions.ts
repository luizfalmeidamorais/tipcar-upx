"use server";

import { getServerSession } from "@/lib/get-session";
import { addPoints } from "@/lib/points";
import prisma from "@/lib/prisma";

export async function decideRequest(fd: FormData) {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) throw new Error("Login");
  const requestId = String(fd.get("requestId") || "");
  const accept = String(fd.get("accept") || "false") === "true";

  const req = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: { ride: true },
  });
  if (!req) throw new Error("Pedido não existe");
  if (req.ride.driverId !== user.id) throw new Error("Apenas o motorista");

  if (!accept) {
    await prisma.rideRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });
    return { ok: true };
  }

  await prisma.$transaction(async (tx) => {
    await tx.rideRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });
    await tx.ridePassenger.create({
      data: { rideId: req.rideId, userId: req.userId },
    });
  });
  await addPoints(req.userId, 20, "Entrou na carona", req.rideId);
  await addPoints(req.ride.driverId, 30, "Ofereceu carona", req.rideId);
  return { ok: true };
}
