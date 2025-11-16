"use server";

import { getServerSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";

// ---------- Utils de fuso/hora Brasília ----------
const TZ_BR = "America/Sao_Paulo";

/** Converte string do <input type="datetime-local"> (ex: "2025-11-02T10:00")
 *  interpretando como hora local de Brasília -> retorna Date em UTC. */
function zonedLocalToUTC_br(datetimeLocal: string): Date {
  // datetimeLocal SEM timezone (parece local). Vamos tratar como BR e converter p/ UTC.
  const [d, t = "00:00"] = datetimeLocal.split("T");
  const [Y, M, D] = d.split("-").map(Number);
  const [h, m] = t.split(":").map(Number);
  // base em UTC no mesmo “parece” horário…
  const fakeUTC = new Date(
    Date.UTC(Y, (M ?? 1) - 1, D ?? 1, h ?? 0, m ?? 0, 0)
  );

  // calcula o offset BR naquele instante:
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ_BR,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(fakeUTC).map((p) => [p.type, p.value])
  );
  const asIfInBR_utcMs = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );
  // Offset é diferença entre “data renderizada em BR” e o timestamp base
  const offsetMs = asIfInBR_utcMs - fakeUTC.getTime();
  // Para obter o UTC real que corresponde àquele wall time BR, subtraímos o offset:
  return new Date(fakeUTC.getTime() - offsetMs);
}

// ---------- Action ----------
type LatLng = { lat: number; lng: number };

async function geocode(address: string): Promise<LatLng> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "TipCar/1.0 (contato@exemplo.com)",
      "Accept-Language": "pt-BR",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Falha na geocodificação");
  const data = await res.json();
  if (!data?.[0]) throw new Error(`Endereço não encontrado: ${address}`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function routeOSRM(origin: LatLng, dest: LatLng) {
  const coords = `${origin.lng},${origin.lat};${dest.lng},${dest.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha na rota OSRM");
  const data = await res.json();
  const geometry = data?.routes?.[0]?.geometry;
  if (!geometry) throw new Error("Sem geometria de rota");
  return {
    type: "FeatureCollection",
    features: [
      { type: "Feature", geometry, properties: { mode: "driving" } },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [origin.lng, origin.lat] },
        properties: { kind: "origin" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [dest.lng, dest.lat] },
        properties: { kind: "dest" },
      },
    ],
  };
}

function straightLine(origin: LatLng, dest: LatLng) {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [origin.lng, origin.lat],
            [dest.lng, dest.lat],
          ],
        },
        properties: { fallback: true },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [origin.lng, origin.lat] },
        properties: { kind: "origin" },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [dest.lng, dest.lat] },
        properties: { kind: "dest" },
      },
    ],
  };
}

export async function createRide(fd: FormData) {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) throw new Error("Login necessário");

  const originName = String(fd.get("originName") || "").trim();
  const destName = String(fd.get("destName") || "").trim();
  const departAt = String(fd.get("departAt") || ""); // <input type="datetime-local" name="departAt">
  const capacity = Number(fd.get("seatsTotal") || 1);
  const priceCents = Number(fd.get("priceCents") || 0); // 👈 agora aceitando preço

  if (!originName || !destName) throw new Error("Informe origem e destino");
  if (!departAt) throw new Error("Informe data/hora de saída");

  // Converte o local BR -> UTC (para gravar no banco em UTC)
  const startsAt = zonedLocalToUTC_br(departAt);

  const origin = await geocode(originName);
  const dest = await geocode(destName);

  let routeGeoJson: any;
  try {
    routeGeoJson = await routeOSRM(origin, dest);
  } catch {
    routeGeoJson = straightLine(origin, dest); // fallback
  }

  const title = `${originName} → ${destName}`;

  await prisma.ride.create({
    data: {
      driverId: user.id,
      title,
      priceCents,
      capacity,
      startsAt, // UTC no banco
      originName,
      destName,
      originLat: origin.lat,
      originLng: origin.lng,
      destLat: dest.lat,
      destLng: dest.lng,
      routeGeoJson: JSON.stringify(routeGeoJson),
    },
  });

  return { ok: true };
}
