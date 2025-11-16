import prisma from "@/lib/prisma";
import StoreClient from "./ui/StoreClient";
import { getServerSession } from "@/lib/get-session";
import { redeem } from "../rewards/actions";

export default async function Page() {
    const session = await getServerSession()
    const user = session?.user
    if (!user) return <div>Faça login</div>

    const me = await prisma.user.findUnique({ where: { id: user.id } })
    const rewards = await prisma.reward.findMany({ include: { partner: true } })
    const offers = rewards.map(r => ({ id: r.id, partner: r.partner.name, cost: r.cost, cashbackPct: 5 }))

    return (
        <StoreClient
            offers={offers}
            balance={me?.points ?? 0}
            action={async (fd: FormData) => {
                "use server"
                const id = String(fd.get('offerId') ?? '')
                return redeem(id)
            }}
        />
    )
}
