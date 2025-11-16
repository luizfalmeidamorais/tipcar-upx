import { isDriverApproved } from '@/lib/driver'
import { getServerSession } from '@/lib/get-session'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function Page() {
    const session = await getServerSession()
    const me = session?.user
    const approved = me ? await isDriverApproved(me.id) : false

    const pending = approved && me
        ? await prisma.rideRequest.count({ where: { status: 'PENDING', ride: { driverId: me.id } } })
        : 0

    return (
        <div className="grid gap-4">
            <section className="rounded-2xl bg-gradient-to-br from-sky-600 to-sky-700 p-5 text-white shadow">
                <h1 className="text-xl font-semibold">T I P  C A R</h1>
                <p className="mt-1 text-sm text-white/90">{me ? `Olá, ${me.name}` : 'Faça login para explorar caronas'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/explore" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-sky-700 shadow">Ver caronas</Link>

                    {/* 👇 só aparece se NÃO for aprovado */}
                    {!approved && (
                        <Link href="/driver/verify" className="rounded-md bg-white/20 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/50">
                            Quero ser motorista
                        </Link>
                    )}

                    <Link href="/store" className="rounded-md bg-white/20 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/50">Loja de pontos</Link>
                    <Link href="/wallet" className="rounded-md bg-white/20 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/50">Carteira</Link>
                </div>
            </section>

            {approved ? (
                <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <h2 className="mb-2 text-base font-semibold">Painel do motorista</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/driver/rides/new" className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white">Criar carona</Link>
                        <Link href="/driver/requests" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                            Solicitações {pending > 0 && <span className="ml-2 rounded bg-emerald-500 px-2 py-0.5 text-[10px]">{pending}</span>}
                        </Link>
                        <Link href="/explore" className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">Minhas caronas</Link>
                    </div>
                </section>
            ) : (
                <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <h2 className="mb-2 text-base font-semibold">Para passageiros</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/explore" className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white">Explorar caronas</Link>
                        <Link href="/store" className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Trocar pontos</Link>
                    </div>
                </section>
            )}
        </div>
    )
}