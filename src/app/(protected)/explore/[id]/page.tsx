import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import { cancelRide, requestSeat } from "../../rides/[id]/actions";
import RideDetailClient from "./RideDetailClient";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getServerSession();
    const me = session?.user;

    const ride = await prisma.ride.findUnique({
        where: { id },
        include: {
            driver: true,
            passengers: { include: { user: true } },
            requests: { include: { user: true } },
        },
    });

    if (!ride) return <div className="p-6">Carona não encontrada</div>;

    const driverVerification = await prisma.driverVerification.findUnique({
        where: { userId: ride.driverId },
    });

    const isDriver = me?.id === ride.driverId;

    const hasRequested = ride.requests.some((r) => r.userId === me?.id);
    const isPassengerApproved = ride.passengers.some((p) => p.userId === me?.id);

    const data = {
        id: ride.id,
        originName: ride.originName,
        destName: ride.destName,
        startsAt: ride.startsAt.toISOString(),
        status: ride.status,
        capacity: ride.capacity,
        priceCents: ride.priceCents,
        seatsLeft: ride.capacity - ride.passengers.length,
        routeGeoJson: ride.routeGeoJson,

        isDriver,
        hasRequested,
        isPassengerApproved,

        driver: {
            id: ride.driverId,
            name: ride.driver.name ?? ride.driver.email,
            vehicleModel: driverVerification?.vehicleModel,
            plate: driverVerification?.plate,
            rating: 4.8,
            ridesCount: ride.passengers.length,
        },
    };

    return (
        <RideDetailClient
            actionCancelRide={cancelRide}
            actionRequestSeat={async (fd) => {
                "use server";
                const r = String(fd.get("rideId") || "");
                return requestSeat(r);
            }}
            ride={data}
        />
    );
}
