import prisma from "@/lib/prisma";
import BottomNavClient from "./BottomNavClient";
import { getServerSession } from "@/lib/get-session";

async function isDriverApproved(userId: string) {
    const u = await prisma.user.findUnique({
        where: { id: userId },
        select: { driverStatus: true, isDriver: true },
    });
    if (!u) return false;
    if (u.isDriver || u.driverStatus === "APPROVED") return true;

    // se você usa uma tabela separada de verificação:
    const ver = await prisma.driverVerification.findUnique({
        where: { userId },
        select: { status: true },
    });
    return ver?.status === "APPROVED";
}

export default async function BottomNavServer() {
    const session = await getServerSession()
    const me = session?.user
    const approved = me ? await isDriverApproved(me.id) : false;
    return <BottomNavClient approved={approved} />;
}
