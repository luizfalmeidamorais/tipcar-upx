"use server";

import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

export async function requestDriverVerification(formData: FormData) {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) throw new Error("Login");

  const licenseNumber = String(formData.get("licenseNumber") || "");
  const vehicleModel = String(formData.get("vehicleModel") || "");
  const plate = String(formData.get("plate") || "");

  await prisma.driverVerification.upsert({
    where: { userId: user.id },
    update: { licenseNumber, vehicleModel, plate, status: "PENDING" },
    create: { userId: user.id, licenseNumber, vehicleModel, plate },
  });
}

// Para DEMO rápida: aprova o próprio usuário (em produção seria admin)
export async function approveMe() {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) throw new Error("Login");

  await prisma.user.update({
    where: { id: user.id },
    data: { isDriver: true, driverStatus: "APPROVED" },
  });
}
