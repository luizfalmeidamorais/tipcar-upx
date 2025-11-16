import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function Page() {
    const session = await getServerSession()
    const me = session?.user
    if (!me) return <div className="p-4">Faça login</div>;

    const user = await prisma.user.findUnique({
        where: { id: me.id },
        select: {
            name: true,
            email: true,
            points: true,
            driverStatus: true,
            isDriver: true,
            ridesAsDriver: { select: { id: true }, take: 1 },
        },
    });

    // se você guarda dados do veículo em outra tabela
    const ver = await prisma.driverVerification.findUnique({
        where: { userId: me.id },
        select: { vehicleModel: true, plate: true, status: true },
    });

    const isDriverApproved =
        user?.isDriver || user?.driverStatus === "APPROVED" || ver?.status === "APPROVED";

    return (
        <ProfileClient
            name={user?.name ?? me.email ?? "Usuário"}
            subtitle={
                isDriverApproved
                    ? `Motorista${ver?.vehicleModel ? ` • ${ver.vehicleModel} • ${ver?.plate ?? ""}` : ""}`
                    : "Passageiro"
            }
            points={user?.points ?? 0}
            isDriverApproved={!!isDriverApproved}
        />
    );
}
