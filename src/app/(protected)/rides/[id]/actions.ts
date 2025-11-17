"use server";

import { getServerSession } from "@/lib/get-session";
import { addPoints, removePoints } from "@/lib/points";
import prisma from "@/lib/prisma";

export async function requestSeat(rideId: string) {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) throw new Error("Faça login");

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { passengers: true },
  });
  if (!ride) throw new Error("Carona não encontrada");

  const seatsLeft = ride.capacity - ride.passengers.length;
  if (seatsLeft <= 0) throw new Error("Sem vagas");

  await prisma.rideRequest.create({ data: { rideId, userId: user.id } });

  return { ok: true };
}

export async function approveRequest(requestId: string) {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) throw new Error("Login");

  const req = await prisma.rideRequest.findUnique({
    where: { id: requestId },
    include: { ride: true },
  });
  if (!req) throw new Error("Pedido não existe");

  if (req.ride.driverId !== user.id) throw new Error("Apenas o motorista");

  await prisma.$transaction(async (tx) => {
    await tx.rideRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    });

    await tx.ridePassenger.create({
      data: { rideId: req.rideId, userId: req.userId },
    });
  });

  // Pontos simples: +20 para passageiro, +30 para motorista
  await addPoints(req.userId, 20, "Entrou na carona", req.rideId);
  await addPoints(req.ride.driverId, 30, "Ofereceu carona", req.rideId);

  return { ok: true };
}

// cancelar carona (motorista)
export async function cancelRide(fd: FormData) {
  const rideId = String(fd.get("rideId") || "");
  const session = await getServerSession();
  const me = session?.user;
  if (!me) throw new Error("Login necessário");

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      passengers: true,
      requests: true
    }
  });
  if (!ride) throw new Error("Carona não encontrada");
  if (ride.driverId !== me.id) throw new Error("Somente o motorista");
  if (ride.status !== "OPEN") throw new Error("Já cancelada");

  // remove pontos
  await prisma.$transaction(async (tx) => {
    // motorista perde 30
    await removePoints(ride.driverId, 30, "Cancelou carona", ride.id);

    // cada passageiro aprovado perde 20
    for (const p of ride.passengers) {
      await removePoints(p.userId, 20, "Carona cancelada", ride.id);
    }

    await tx.ride.update({
      where: { id: ride.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });
  });

  return { ok: true };
}