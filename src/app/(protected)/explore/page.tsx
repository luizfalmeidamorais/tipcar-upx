import { searchRides } from './actions'
import prisma from '@/lib/prisma'
import ExploreClient from './ui/ExploreClient'

export default async function Page() {
    const rides = await prisma.ride.findMany({ orderBy: { startsAt: 'asc' }, include: { passengers: true } })
    const initial = {
        items: rides.map(r => ({
            id: r.id,
            originName: r.originName, originLat: r.originLat, originLng: r.originLng,
            destName: r.destName, destLat: r.destLat, destLng: r.destLng,
            departAt: r.startsAt.toISOString(),
            seatsTotal: r.capacity,
            seatsAvail: r.capacity - r.passengers.length,
            driverId: r.driverId
        }))
    }
    return <ExploreClient initial={initial} action={searchRides} />
}
