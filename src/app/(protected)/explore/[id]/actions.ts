// app/(protected)/rides/[id]/actions.ts

"use server";

import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

export async function cancelRide(fd: FormData) {
  const rideId = String(fd.get("rideId") || "");
  if (!rideId) throw new Error("Carona inválida");

  const session = await getServerSession();
  const me = session?.user;
  if (!me) throw new Error("Não autenticado");

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: {
      passengers: true,
      requests: true,
    },
  });

  if (!ride) throw new Error("Carona não encontrada");
  if (ride.driverId !== me.id) throw new Error("Só o motorista pode cancelar");

  // ❗REMOVE PONTOS DE TODOS
  const passengersIds = ride.passengers.map((p) => p.userId);
  const allUsersToAdjust = [ride.driverId, ...passengersIds];

  await prisma.user.updateMany({
    where: { id: { in: allUsersToAdjust } },
    data: { points: { decrement: 5 } }, // ❗ você escolhe o valor
  });

  // ❗REJEITA PEDIDOS PENDENTES
  await prisma.rideRequest.updateMany({
    where: { rideId },
    data: { status: "REJECTED" },
  });

  // ❗CANCELA A CARONA
  await prisma.ride.update({
    where: { id: rideId },
    data: { status: "CANCELLED" },
  });

  return { ok: true, cancelled: true };
}
