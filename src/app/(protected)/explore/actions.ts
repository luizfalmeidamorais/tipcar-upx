"use server";

import prisma from "@/lib/prisma";

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 6371,
    dLat = ((b.lat - a.lat) * Math.PI) / 180,
    dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1));
}

export async function searchRides(fd: FormData) {
  const q = String(fd.get("q") || "")
    .trim()
    .toLowerCase();
  const near = String(fd.get("near") || "true") === "true";
  const lat = Number(fd.get("lat"));
  const lng = Number(fd.get("lng"));

  // 🔑 Regra: se não tem lat/lng e q vazio, NÃO aplicar filtro por data.
  const hasLocation = Number.isFinite(lat) && Number.isFinite(lng);
  const hasQuery = q.length > 0;
  const whereTime =
    hasLocation || hasQuery
      ? { startsAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // último dia
      : undefined;

  const rides = await prisma.ride.findMany({
    where: whereTime, // ✅ só filtra por tempo quando faz sentido
    orderBy: { startsAt: "asc" },
    include: { passengers: true, driver: true },
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
    driverId: r.driverId,
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
