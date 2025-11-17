"use server";

import type { RequestStatus, RideStatus } from "@/generated/prisma";
import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371; // km
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(s));
}

// tipo interno pra deixar TS feliz
type SearchItem = {
  id: string;
  originName: string;
  originLat: number;
  originLng: number;
  destName: string;
  destLat: number;
  destLng: number;
  departAt: string;
  seatsTotal: number;
  seatsAvail: number;

  isDriver: boolean;
  isPassenger: boolean;
  requestStatus: RequestStatus | null;
  rideStatus: RideStatus;

  km: number | null;
};

export async function searchRides(
  fd: FormData
): Promise<{ items: SearchItem[] }> {
  const session = await getServerSession();
  const me = session?.user;
  // importante: NUNCA null, sempre string ou undefined
  const userId: string | undefined = me?.id ?? undefined;

  const q = String(fd.get("q") || "")
    .trim()
    .toLowerCase();
  const near = String(fd.get("near") || "true") === "true";
  const lat = Number(fd.get("lat"));
  const lng = Number(fd.get("lng"));

  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);
  const hasQuery = q.length > 0;

  const whereTime =
    hasLocation || hasQuery
      ? { startsAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      : undefined;

  const rides = await prisma.ride.findMany({
    where: whereTime,
    orderBy: { startsAt: "asc" },
    include: {
      passengers: userId ? { where: { userId } } : undefined,
      requests: userId ? { where: { userId } } : undefined,
      driver: true,
    },
  });

  let items: SearchItem[] = rides.map((r) => ({
    id: r.id,
    originName: r.originName,
    originLat: r.originLat,
    originLng: r.originLng,
    destName: r.destName,
    destLat: r.destLat,
    destLng: r.destLng,
    departAt: r.startsAt.toISOString(),
    seatsTotal: r.capacity,
    seatsAvail: r.capacity - r.passengers.length,

    isDriver: userId === r.driverId,
    isPassenger: r.passengers.length > 0,
    requestStatus: r.requests[0]?.status ?? null,
    rideStatus: r.status,

    km: null, // <- aqui já é number | null
  }));

  if (hasQuery) {
    items = items.filter((i) =>
      `${i.originName} ${i.destName}`.toLowerCase().includes(q)
    );
  }

  if (near && hasLocation) {
    const here = { lat, lng };
    items = items
      .map((i) => ({
        ...i,
        km: haversineKm(here, { lat: i.originLat, lng: i.originLng }),
      }))
      .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
  }

  return { items };
}
