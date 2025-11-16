import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import WalletClient from "./ui/WalletClient";

export default async function Page() {
    const session = await getServerSession()
    const me = session?.user
    if (!me) return <div className="p-4">Faça login</div>;

    const [user, ledgers, redemptions] = await Promise.all([
        prisma.user.findUnique({ where: { id: me.id }, select: { points: true } }),
        prisma.pointsLedger.findMany({
            where: { userId: me.id },
            orderBy: { createdAt: "desc" },
            take: 50,
        }),
        prisma.redemption.findMany({
            where: { userId: me.id },
            include: { reward: { include: { partner: true } } },
            orderBy: { createdAt: "desc" },
            take: 50,
        }),
    ]);

    // normaliza em um único array
    const items = [
        ...ledgers.map((l) => ({
            id: `L-${l.id}`,
            when: l.createdAt,
            title: l.reason,
            delta: l.delta,     // >0 entrada, <0 saída
            kind: "points" as const,
        })),
        ...redemptions.map((r) => ({
            id: `R-${r.id}`,
            when: r.createdAt,
            title: `Resgate ${r.reward.partner.name} — ${r.reward.name}`,
            delta: -r.reward.cost, // saída de pontos
            kind: "redeem" as const,
            code: r.code,
        })),
    ].sort((a, b) => +b.when - +a.when);

    return (
        <WalletClient
            balance={user?.points ?? 0}
            items={items.map((i) => ({
                ...i,
                whenText: new Date(i.when).toLocaleString("pt-BR"),
            }))}
        />
    );
}
