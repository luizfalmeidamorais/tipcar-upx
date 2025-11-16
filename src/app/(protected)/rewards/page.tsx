import prisma from '@/lib/prisma';
import { redeem } from './actions'

export default async function RewardsPage() {
    const rewards = await prisma.reward.findMany({ include: { partner: true } })

    return (
        <div className="grid gap-4">
            <h1 className="text-xl font-bold">Loja de Pontos</h1>
            <div className="grid sm:grid-cols-2 gap-3">
                {rewards.map(r => (
                    <form key={r.id} action={async () => { 'use server'; const res = await redeem(r.id) }} className="bg-white p-4 rounded-xl border grid gap-2">
                        <h3 className="font-semibold">{r.name}</h3>
                        <p className="text-sm">Parceiro: {r.partner.name}</p>
                        <p className="text-sm">Custa: {r.cost} pts</p>
                        <p className="text-xs text-gray-500">Estoque: {r.stock}</p>
                        <button className="px-4 py-2 rounded bg-black text-white">Resgatar</button>
                    </form>
                ))}
            </div>
        </div>
    )
}