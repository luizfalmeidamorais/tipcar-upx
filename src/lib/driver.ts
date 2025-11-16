import prisma from "./prisma";

export async function isDriverApproved(userId: string) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { driverStatus: true, isDriver: true },
  });
  if (!u) return false;
  if (u.driverStatus === "APPROVED" || u.isDriver) return true;

  const ver = await prisma.driverVerification.findUnique({
    where: { userId },
    select: { status: true },
  });
  return ver?.status === "APPROVED";
}
