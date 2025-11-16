import Link from 'next/link'
import { format } from './utils'
import { formatDateTimeBR } from '@/lib/datetime'


export function RideCard({ ride }: { ride: any }) {
    return (
        <Link href={`/rides/${ride.id}`} className="block border rounded-xl p-4 bg-white hover:shadow">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">{ride.title}</h3>
                <span className="text-sm">{format.currency(ride.priceCents)}</span>
            </div>
            <p className="text-sm text-gray-600">Vagas: {ride.capacity - ride.passengers.length}</p>
            <p className="text-xs text-gray-500">Saída: {formatDateTimeBR(ride.startsAt)}</p>
        </Link>
    )
}