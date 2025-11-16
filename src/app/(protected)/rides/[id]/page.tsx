import Map from '@/components/map'
import { requestSeat, approveRequest } from './actions'
import { getServerSession } from '@/lib/get-session'
import prisma from '@/lib/prisma'

export default async function RidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession()
    const user = session?.user
    const ride = await prisma.ride.findUnique({
        where: { id },
        include: { driver: true, passengers: { include: { user: true } }, requests: { include: { user: true } } }
    })
    if (!ride) return <div>Carona não encontrada</div>

    const isDriver = user?.id === ride.driverId
    const seatsLeft = ride.capacity - ride.passengers.length

    return (
        <div className="grid gap-4">
            <div className="bg-white p-4 rounded-xl border">
                <h1 className="text-xl font-bold">{ride.title}</h1>
                <p>Motorista: {ride.driver.name ?? ride.driver.email}</p>
                <p>Vagas: {seatsLeft}</p>
            </div>

            <Map routeGeoJson={JSON.parse(ride.routeGeoJson)} />

            <div className="grid gap-2">
                {!isDriver && user && seatsLeft > 0 && (
                    <form action={async () => { 'use server'; await requestSeat(ride.id) }}>
                        <button className="px-4 py-2 rounded-lg bg-black text-white">Pedir vaga</button>
                    </form>
                )}
                {isDriver && (
                    <div className="bg-white p-4 rounded-xl border">
                        <h2 className="font-semibold mb-2">Pedidos pendentes</h2>
                        <div className="grid gap-2">
                            {ride.requests.filter(r => r.status === 'PENDING').map(r => (
                                <form key={r.id} action={async () => { 'use server'; await approveRequest(r.id) }} className="flex items-center gap-2">
                                    <span className="text-sm flex-1">{r.user.name ?? r.user.email}</span>
                                    <button className="px-3 py-1 rounded bg-green-600 text-white">Aprovar</button>
                                </form>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}