"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Loader2, MessageCircle, Phone, Star } from "lucide-react";
import maplibregl from "maplibre-gl";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { formatDateTimeBR } from "@/lib/datetime";

const Map = dynamic(() => import("@/components/map"), { ssr: false });

type RideStatus = "OPEN" | "CANCELLED" | "COMPLETED";

type RideData = {
    id: string;
    originName: string;
    destName: string;
    startsAt: string;
    priceCents: number;
    capacity: number;
    seatsLeft: number;
    status: RideStatus;

    isDriver: boolean;
    hasRequested: boolean;
    isPassengerApproved: boolean;

    routeGeoJson: any;

    driver: {
        id: string;
        name: string;
        vehicleModel?: string;
        plate?: string;
        rating?: number;
        ridesCount?: number;
    };
};

export default function RideDetailClient({
    ride,
    actionRequestSeat,
    actionCancelRide,
}: {
    ride: RideData;
    actionRequestSeat: (fd: FormData) => Promise<any>;
    actionCancelRide: (fd: FormData) => Promise<any>;
}) {
    const { back } = useRouter();

    const [pending, startTransition] = useTransition();
    const [requested, setRequested] = useState(ride.hasRequested);
    const [playing, setPlaying] = useState(false);

    const [canceling, startCancel] = useTransition();
    const [cancelMsg, setCancelMsg] = useState<string | null>(null);
    const [cancelErr, setCancelErr] = useState<string | null>(null);

    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    // ============================================================
    // EXTRAIR COORDENADAS DA ROTA
    // ============================================================
    const lineCoords = useMemo<[number, number][]>(() => {
        try {
            const data =
                typeof ride.routeGeoJson === "string"
                    ? JSON.parse(ride.routeGeoJson)
                    : ride.routeGeoJson;

            const feat = data?.features?.find(
                (f: any) => f?.geometry?.type === "LineString"
            );
            return feat?.geometry?.coordinates ?? [];
        } catch {
            return [];
        }
    }, [ride.routeGeoJson]);

    // suavizar rota
    const coords = useMemo<[number, number][]>(() => {
        const L = lineCoords.length;
        if (L < 2) return lineCoords;
        const out: [number, number][] = [];
        const PARTS = 200;
        for (let s = 0; s < L - 1; s++) {
            const [x1, y1] = lineCoords[s];
            const [x2, y2] = lineCoords[s + 1];
            const pieces = Math.max(1, Math.floor(PARTS / (L - 1)));
            for (let i = 0; i < pieces; i++) {
                const t = i / pieces;
                out.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
            }
        }
        out.push(lineCoords[L - 1]);
        return out;
    }, [lineCoords]);

    // ============================================================
    // MAPA + ANIMAÇÃO
    // ============================================================
    const mapRef = useRef<maplibregl.Map | null>(null);
    const carRef = useRef<maplibregl.Marker | null>(null);

    const idxRef = useRef(0);
    const fracRef = useRef(0);
    const runningRef = useRef(false);
    const lastTsRef = useRef<number | null>(null);

    const SPEED = 20;
    const rafRef = useRef<number | null>(null);

    const onMapReady = (map: maplibregl.Map) => {
        mapRef.current = map;
        if (!coords.length) return;

        const el = document.createElement("div");
        el.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" style="transform: translate(-50%, -50%);">
        <path d="M3 13l1-3 3-3h8l3 3 1 3v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-4z" fill="#111827"/>
        <circle cx="7.5" cy="18" r="1.6" fill="#9ca3af"/>
        <circle cx="16.5" cy="18" r="1.6" fill="#9ca3af"/>
      </svg>
    `;

        carRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(coords[0])
            .addTo(map);
    };

    const step = (ts: number) => {
        if (!(runningRef.current && carRef.current) || coords.length < 2) return;

        if (lastTsRef.current == null) lastTsRef.current = ts;
        const dt = (ts - lastTsRef.current) / 1000;
        lastTsRef.current = ts;

        fracRef.current += dt * SPEED;

        while (fracRef.current >= 1 && idxRef.current < coords.length - 2) {
            fracRef.current -= 1;
            idxRef.current += 1;
        }

        const i = idxRef.current;
        const j = Math.min(i + 1, coords.length - 1);

        const [x1, y1] = coords[i];
        const [x2, y2] = coords[j];
        const t = Math.min(fracRef.current, 1);

        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;

        carRef.current.setLngLat([x, y]);

        if (i >= coords.length - 2 && fracRef.current >= 1) {
            runningRef.current = false;
            setPlaying(false);
            return;
        }

        rafRef.current = requestAnimationFrame(step);
    };

    const playPause = () => {
        if (!coords.length || ride.status !== "OPEN") return;
        runningRef.current = !runningRef.current;
        if (runningRef.current) {
            lastTsRef.current = null;
            rafRef.current = requestAnimationFrame(step);
        }
        setPlaying(runningRef.current);
    };

    const resetRun = () => {
        runningRef.current = false;
        cancelAnimationFrame(rafRef.current || 0);
        idxRef.current = 0;
        fracRef.current = 0;
        lastTsRef.current = null;
        if (coords.length && carRef.current) carRef.current.setLngLat(coords[0]);
        setPlaying(false);
    };

    useEffect(() => () => cancelAnimationFrame(rafRef.current || 0), []);

    // ============================================================
    // PEDIR VAGA
    // ============================================================
    const askSeat = () => {
        const fd = new FormData();
        fd.set("rideId", ride.id);

        startTransition(async () => {
            try {
                await actionRequestSeat(fd);
                setRequested(true);
                setMsg("Pedido enviado!");
            } catch (e: any) {
                setErr(e?.message ?? "Erro ao pedir vaga.");
            }
        });
    };

    // ============================================================
    // CANCELAR CARONA (MOTORISTA)
    // ============================================================
    const cancelRideNow = () => {
        if (!confirm("Cancelar carona?\nMotorista e passageiros perdem pontos."))
            return;

        const fd = new FormData();
        fd.set("rideId", ride.id);

        startCancel(async () => {
            try {
                await actionCancelRide(fd);
                setCancelMsg("Carona cancelada.");
                runningRef.current = false;
                setPlaying(false);
            } catch (e: any) {
                setCancelErr(e?.message ?? "Erro ao cancelar.");
            }
        });
    };

    const price = (ride.priceCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    return (
        <div className="min-h-dvh bg-white">
            <div className="pt-[env(safe-area-inset-top)]" />

            <header className="sticky top-[env(safe-area-inset-top)] z-40 flex h-12 items-center bg-[#0D74CE] px-3 text-white">
                <button className="rounded p-1 hover:bg-white/10" onClick={back}>
                    <ArrowLeft className="h-6 w-6" />
                </button>

                <h1 className="mx-auto w-[70%] truncate text-center font-semibold text-sm">
                    {ride.originName} → {ride.destName}
                </h1>

                <div className="w-6" />
            </header>

            {/* MAPA */}
            <section className="relative h-[360px] overflow-hidden">
                <Map
                    onMapReady={onMapReady}
                    routeGeoJson={ride.routeGeoJson}
                    showAttribution={false}
                />

                <div className="absolute top-3 left-3 rounded bg-white/80 p-1 text-xs">
                    Saída: {formatDateTimeBR(ride.startsAt)}
                </div>

                {ride.isDriver && ride.status === "OPEN" && (
                    <div className="absolute bottom-3 left-3 z-20 flex gap-2">
                        <button
                            className="rounded bg-black/80 px-3 py-2 text-white shadow"
                            onClick={playPause}
                        >
                            {playing ? "Pausar" : "Iniciar"}
                        </button>

                        <button
                            className="rounded bg-white/90 px-3 py-2 text-black shadow"
                            onClick={resetRun}
                        >
                            Reiniciar
                        </button>
                    </div>
                )}
            </section>

            {/* DETALHES */}
            <main className="-mt-2 rounded-t-xl bg-white px-5 pt-4 pb-8 shadow">
                {/* MOTORISTA */}
                <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-300">
                        <svg className="h-7 w-7 text-gray-600" viewBox="0 0 24 24">
                            <path
                                d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>

                    <div className="flex-1">
                        <p className="font-semibold text-lg">{ride.driver.name}</p>

                        <div className="mt-0.5 flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    className={`h-4 w-4 ${i < Math.round(ride.driver.rating ?? 0)
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-300"
                                        }`}
                                    key={i}
                                />
                            ))}
                        </div>

                        <p className="mt-1 text-gray-600 text-xs">
                            {ride.driver.vehicleModel ?? "Veículo"} •{" "}
                            {ride.driver.plate ?? "PLACA"}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold text-lg">{price}</p>
                        <p className="text-slate-600 text-xs">
                            {ride.seatsLeft} de {ride.capacity}
                        </p>
                    </div>
                </div>

                {/* STATUS */}
                {ride.status === "CANCELLED" && (
                    <p className="mt-3 rounded bg-red-50 p-2 text-red-700 text-sm">
                        Esta carona foi cancelada.
                    </p>
                )}

                {ride.status === "COMPLETED" && (
                    <p className="mt-3 rounded bg-slate-100 p-2 text-slate-700 text-sm">
                        Carona finalizada.
                    </p>
                )}

                {cancelMsg && (
                    <p className="mt-3 rounded bg-emerald-50 p-2 text-emerald-700 text-sm">
                        {cancelMsg}
                    </p>
                )}

                {cancelErr && (
                    <p className="mt-3 rounded bg-red-50 p-2 text-red-700 text-sm">
                        {cancelErr}
                    </p>
                )}

                {/* pedir vaga — passageiro */}
                {!ride.isDriver &&
                    ride.status === "OPEN" &&
                    !ride.isPassengerApproved && (
                        <motion.button
                            className="mt-4 w-full rounded bg-[#0D74CE] py-3 text-white shadow disabled:opacity-50"
                            disabled={pending || requested}
                            onClick={askSeat}
                            whileTap={{ scale: 0.97 }}
                        >
                            {pending ? (
                                <>
                                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : requested ? (
                                "Pedido enviado"
                            ) : (
                                "Pedir vaga"
                            )}
                        </motion.button>
                    )}

                {/* mensagem se já está aprovado */}
                {ride.isPassengerApproved && (
                    <p className="mt-4 rounded bg-emerald-50 p-2 text-emerald-700 text-sm">
                        Você está nesta carona!
                    </p>
                )}

                {/* cancelar — motorista */}
                {ride.isDriver && ride.status === "OPEN" && (
                    <motion.button
                        className="mt-4 w-full rounded bg-red-600 py-3 text-white shadow disabled:opacity-50"
                        disabled={canceling}
                        onClick={cancelRideNow}
                        whileTap={{ scale: 0.97 }}
                    >
                        {canceling ? "Cancelando..." : "Cancelar carona"}
                    </motion.button>
                )}

                {/* ações rápidas */}
                <div className="mt-6 flex justify-around">
                    <button className="grid h-14 w-14 place-items-center rounded-full bg-black text-white active:scale-95">
                        <Phone className="h-7 w-7" />
                    </button>
                    <button className="grid h-14 w-14 place-items-center rounded-full bg-black text-white active:scale-95">
                        <MessageCircle className="h-7 w-7" />
                    </button>
                </div>

                <div className="mt-4 flex justify-center">
                    <div className="h-1.5 w-28 rounded-full bg-gray-300" />
                </div>
            </main>
        </div>
    );
}
