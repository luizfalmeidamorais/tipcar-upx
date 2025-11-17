"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { authCLient } from "@/lib/auth-client";
import prisma from "@/lib/prisma";

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);

  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(s));
}

export async function searchRides(fd: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const me = session?.user;
  const userId = me?.id ?? undefined;

  const q = String(fd.get("q") || "")
    .trim()
    .toLowerCase();
  const near = String(fd.get("near") || "") === "true";
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
      passengers: { where: { userId } },
      requests: { where: { userId } },
      driver: true,
    },
  });

  let items = rides.map((r) => ({
    id: r.id,
    originName: (r as any).originName ?? "Origem",
    originLat: r.originLat,
    originLng: r.originLng,
    destName: (r as any).destName ?? "Destino",
    destLat: r.destLat,
    destLng: r.destLng,
    departAt: r.startsAt.toISOString(),
    seatsTotal: r.capacity,
    seatsAvail: r.capacity - r.passengers.length,

    // 🔥 status do usuário nessa carona
    isDriver: userId === r.driverId,
    isPassenger: r.passengers.length > 0,
    requestStatus: r.requests[0]?.status ?? null,

    // 🔥 status global da carona
    rideStatus: r.status, // "ACTIVE" | "CANCELLED"
    km: null,
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
