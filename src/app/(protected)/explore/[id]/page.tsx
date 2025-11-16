import { getServerSession } from '@/lib/get-session'
import RideDetailClient from './RideDetailClient'
import { cancelRide, requestSeat as coreRequestSeat, requestSeat } from '@/app/(protected)/rides/[id]/actions' // se você já tem essa action
import prisma from '@/lib/prisma'
// Se não tiver, eu deixo um fallback mais abaixo.

// ✅ Server Action passada via props para o Client
export async function requestSeatAction(fd: FormData) {
    'use server'
    const rideId = String(fd.get('rideId') || '')
    if (!rideId) throw new Error('Carona inválida')
    // reutiliza a action centralizada (melhor p/ pontos, regras etc.)
    return coreRequestSeat ? coreRequestSeat(rideId) : requestSeatFallback(rideId)
}

// (opcional) fallback caso não tenha a action centralizada ainda
async function requestSeatFallback(rideId: string) {
    'use server'
    const session = await getServerSession()
    const me = session?.user
    if (!me) throw new Error('Precisa fazer login')

    const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: { passengers: true }
    })
    if (!ride) throw new Error('Carona não encontrada')
    const seatsLeft = ride.capacity - ride.passengers.length
    if (seatsLeft <= 0) throw new Error('Sem vagas')

    await prisma.rideRequest.create({ data: { rideId, userId: me.id } })
    return { ok: true }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession()
    const me = session?.user
    const ride = await prisma.ride.findUnique({
        where: { id: id },
        include: {
            driver: true,
            passengers: { include: { user: true } },
            requests: { include: { user: true } },
        },
    })
    if (!ride) return <div className="p-6">Carona não encontrada.</div>

    const driverVerification = await prisma.driverVerification.findUnique({
        where: { userId: ride.driverId },
    })

    const isDriver = me?.id === ride.driverId
    const seatsLeft = ride.capacity - ride.passengers.length

    const data = {
        id: ride.id,
        title: ride.title,
        originName: (ride as any).originName ?? 'Origem',
        destName: (ride as any).destName ?? 'Destino',
        startsAt: ride.startsAt.toISOString(),
        seatsLeft,
        status: ride.status,
        capacity: ride.capacity,
        priceCents: ride.priceCents,
        driver: {
            id: ride.driver.id,
            name: ride.driver.name ?? ride.driver.email,
            vehicleModel: driverVerification?.vehicleModel ?? 'Veículo',
            plate: driverVerification?.plate ?? 'PLACA',
            rating: 4.8, // placeholder
            ridesCount: ride.passengers.length,
        },
        routeGeoJson: ride.routeGeoJson,
        isDriver,
        hasRequested: !!ride.requests.find(r => r.userId === me?.id),
    }

    return (
        <RideDetailClient
            ride={data}
            actionRequestSeat={async (fd: FormData) => {
                "use server"
                const rideId = String(fd.get('rideId') ?? '')
                return requestSeat(rideId)        // <- sua action que recebe string
            }}
            actionCancelRide={async (fd) => { 'use server'; return cancelRide(fd) }} // 👈
        />
    )
}
