import prisma from '@/lib/prisma';
import { decideRequest } from './actions'
import RequestsClient from './ui/RequestsClient';
import { getServerSession } from '@/lib/get-session';

export default async function Page() {
    const session = await getServerSession()
    const user = session?.user
    if (!user) return <div>Faça login</div>

    const reqs = await prisma.rideRequest.findMany({
        where: { status: 'PENDING', ride: { driverId: user.id } },
        include: { user: true, ride: true }
    })

    const initial = reqs.map(r => ({
        id: r.id,
        passenger: { name: r.user.name ?? r.user.email },
        ride: { originName: r.ride.originName, destName: r.ride.destName, departAt: r.ride.startsAt }
    }))

    return <RequestsClient initial={initial} action={decideRequest} />
}
