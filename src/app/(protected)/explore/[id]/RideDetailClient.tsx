"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import maplibregl from "maplibre-gl";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, MessageCircle, Star, Loader2 } from "lucide-react";
import { formatDateTimeBR } from "@/lib/datetime";
// Se não importou o CSS do MapLibre globalmente, descomente:
// import "maplibre-gl/dist/maplibre-gl.css";

const Map = dynamic(() => import("@/components/map"), { ssr: false });

type RideStatus = "OPEN" | "CANCELLED" | "COMPLETED";

type RideData = {
    id: string;
    originName: string;
    destName: string;
    startsAt: string; // ISO
    priceCents: number;
    capacity: number;
    seatsLeft: number;
    status: RideStatus;
    driver: {
        id: string;
        name: string;
        vehicleModel?: string;
        plate?: string;
        rating?: number; // 0..5
        ridesCount?: number;
    };
    routeGeoJson: string | any; // FeatureCollection com LineString
    isDriver: boolean;
    hasRequested: boolean;
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
    const [pending, start] = useTransition();
    const [requested, setRequested] = useState(ride.hasRequested);
    const [playing, setPlaying] = useState(false);
    const [cancelMsg, setCancelMsg] = useState<string | null>(null);
    const [cancelErr, setCancelErr] = useState<string | null>(null);
    const [canceling, startCancel] = useTransition();

    // ===== 1) Extrai a LineString =====
    const lineCoords = useMemo<[number, number][]>(() => {
        try {
            const data =
                typeof ride.routeGeoJson === "string"
                    ? JSON.parse(ride.routeGeoJson)
                    : ride.routeGeoJson;
            const feat = data?.features?.find(
                (f: any) => f?.geometry?.type === "LineString"
            );
            return feat?.geometry?.coordinates || [];
        } catch {
            return [];
        }
    }, [ride.routeGeoJson]);

    // ===== 2) Densifica a rota (animação suave) =====
    const coords = useMemo<[number, number][]>(() => {
        const L = lineCoords.length;
        if (L < 2) return lineCoords;
        const out: [number, number][] = [];
        const STEPS_ALVO = 200;
        for (let s = 0; s < L - 1; s++) {
            const [x1, y1] = lineCoords[s];
            const [x2, y2] = lineCoords[s + 1];
            const pieces = Math.max(1, Math.floor(STEPS_ALVO / (L - 1)));
            for (let i = 0; i < pieces; i++) {
                const t = i / pieces;
                out.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
            }
        }
        out.push(lineCoords[L - 1]);
        return out;
    }, [lineCoords]);

    // ===== 3) Mapa e animação (SEM rotação) =====
    const mapRef = useRef<maplibregl.Map | null>(null);
    const carRef = useRef<maplibregl.Marker | null>(null);

    const idxRef = useRef(0); // índice do ponto
    const fracRef = useRef(0); // fração entre pontos
    const runningRef = useRef(false);
    const lastTsRef = useRef<number | null>(null);

    const SPEED_PPS = 20; // pontos por segundo (reduza para mais devagar)

    const onMapReady = (map: maplibregl.Map) => {
        mapRef.current = map;
        if (!coords.length) return;

        const el = document.createElement("div");
        el.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" style="transform: translate(-50%, -50%);">
        <path d="M3 13l1-3 3-3h8l3 3 1 3v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-4z" fill="#111827"/>
        <circle cx="7.5" cy="18" r="1.6" fill="#9ca3af"/>
        <circle cx="16.5" cy="18" r="1.6" fill="#9ca3af"/>
      </svg>`;
        carRef.current?.remove();
        carRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(coords[0])
            .addTo(map);

        idxRef.current = 0;
        fracRef.current = 0;
        lastTsRef.current = null;
    };

    const rafRef = useRef<number | null>(null);
    const step = (ts: number) => {
        if (!runningRef.current || !carRef.current || coords.length < 2) return;

        if (lastTsRef.current == null) lastTsRef.current = ts;
        const dt = (ts - lastTsRef.current) / 1000; // seg
        lastTsRef.current = ts;

        // avança pela velocidade
        fracRef.current += dt * SPEED_PPS;

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

        carRef.current.setLngLat([x, y]); // 👉 sem rotação

        if (i >= coords.length - 2 && fracRef.current >= 1) {
            runningRef.current = false;
            setPlaying(false);
            return;
        }

        rafRef.current = requestAnimationFrame(step);
    };

    const playPause = () => {
        if (!coords.length || !carRef.current) return;
        runningRef.current = !runningRef.current;
        if (runningRef.current) {
            lastTsRef.current = null;
            rafRef.current = requestAnimationFrame(step);
        } else {
            cancelAnimationFrame(rafRef.current || 0);
        }
        setPlaying(runningRef.current);
    };

    const resetRun = () => {
        runningRef.current = false;
        cancelAnimationFrame(rafRef.current || 0);
        idxRef.current = 0;
        fracRef.current = 0;
        lastTsRef.current = null;
        setPlaying(false);
        if (carRef.current && coords.length) carRef.current.setLngLat(coords[0]);
    };

    useEffect(() => {
        return () => cancelAnimationFrame(rafRef.current || 0);
    }, []);

    // ===== 4) Pedir vaga (passageiro) =====
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const askSeat = () => {
        const fd = new FormData();
        fd.set("rideId", ride.id);
        setMsg(null);
        setErr(null);
        start(async () => {
            try {
                await actionRequestSeat(fd);
                setRequested(true);
                setMsg("Pedido enviado ao motorista!");
            } catch (e: any) {
                setErr(e?.message ?? "Falha ao pedir vaga.");
            }
        });
    };

    // ===== 5) Cancelar carona (motorista) =====
    const cancel = () => {
        if (!confirm("Cancelar esta carona? Os pedidos pendentes serão rejeitados.")) return;
        const fd = new FormData();
        fd.set("rideId", ride.id);
        setCancelMsg(null);
        setCancelErr(null);
        startCancel(async () => {
            try {
                await actionCancelRide(fd);
                setCancelMsg("Carona cancelada.");
                runningRef.current = false;
                setPlaying(false);
            } catch (e: any) {
                setCancelErr(e?.message ?? "Falha ao cancelar.");
            }
        });
    };

    const price = (ride.priceCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    return (
        <div className="min-h-dvh w-full bg-white">
            <div className="pt-[env(safe-area-inset-top)]" />
            <header className="sticky top-[env(safe-area-inset-top)] z-40 flex h-12 items-center bg-[#0D74CE] px-3 text-white">
                <button onClick={back} className="rounded-md p-1 hover:bg-white/10" aria-label="Voltar">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="mx-auto w-[70%] truncate text-sm font-semibold">
                    {ride.originName} → {ride.destName}
                </h1>
                <div className="w-6" />
            </header>

            {/* MAPA */}
            <section className="relative h-[360px] overflow-hidden">
                <Map routeGeoJson={ride.routeGeoJson} onMapReady={onMapReady} showAttribution={false} />

                <div className="pointer-events-none absolute left-3 top-3 z-10 rounded bg-white/80 px-2 py-1 text-xs text-slate-700">
                    Saída: {formatDateTimeBR(ride.startsAt)}
                </div>

                {ride.isDriver && ride.status === "OPEN" && (
                    <div className="absolute bottom-3 left-3 z-20 flex gap-2 pointer-events-auto">
                        <button
                            onClick={playPause}
                            className="rounded-md bg-black/80 px-3 py-2 text-sm font-semibold text-white shadow"
                        >
                            {playing ? "Pausar" : idxRef.current === 0 ? "Iniciar percurso" : "Continuar"}
                        </button>
                        <button
                            onClick={resetRun}
                            className="rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-slate-800 shadow"
                        >
                            Reiniciar
                        </button>
                    </div>
                )}
            </section>

            {/* DETALHES */}
            <main className="-mt-2 rounded-t-2xl bg-white px-5 pb-5 pt-3 shadow-[0_-6px_12px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-300">
                        <svg viewBox="0 0 24 24" className="h-7 w-7 text-gray-600">
                            <path
                                fill="currentColor"
                                d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                            />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-lg font-semibold leading-tight text-gray-900">
                            {ride.driver.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.round(ride.driver.rating ?? 0) ? "fill-current" : ""}`}
                                />
                            ))}
                            <span className="ml-1 text-[11px] text-gray-500">
                                {(ride.driver.rating ?? 4.8).toFixed(1)}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                            {(ride.driver.ridesCount ?? 0)} passageiros /{" "}
                            {ride.driver.vehicleModel ?? "Veículo"} / {ride.driver.plate ?? "PLACA"}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-semibold">{price}</p>
                        <p className="text-xs text-slate-500">
                            {ride.seatsLeft} de {ride.capacity} vagas
                        </p>
                    </div>
                </div>

                {/* mensagens */}
                {ride.status === "CANCELLED" && (
                    <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">
                        Esta carona foi cancelada.
                    </p>
                )}
                {ride.status === "COMPLETED" && (
                    <p className="mt-3 rounded-md bg-slate-100 p-2 text-sm text-slate-700">
                        Carona finalizada.
                    </p>
                )}
                {cancelMsg && (
                    <p className="mt-3 rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{cancelMsg}</p>
                )}
                {cancelErr && (
                    <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{cancelErr}</p>
                )}

                {/* pedir vaga — somente passageiro e quando aberta */}
                {!ride.isDriver && ride.status === "OPEN" && (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={pending || requested || ride.seatsLeft <= 0}
                        onClick={askSeat}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-[#0D74CE] py-3 font-semibold text-white shadow disabled:opacity-50"
                    >
                        {pending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                            </>
                        ) : requested ? (
                            "Pedido enviado"
                        ) : ride.seatsLeft > 0 ? (
                            "Pedir vaga"
                        ) : (
                            "Sem vagas"
                        )}
                    </motion.button>
                )}

                {/* cancelar carona — somente motorista e quando aberta */}
                {ride.isDriver && ride.status === "OPEN" && (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        disabled={canceling}
                        onClick={cancel}
                        className="mt-3 w-full rounded-md bg-red-600 py-3 text-sm font-semibold text-white shadow disabled:opacity-60"
                    >
                        {canceling ? "Cancelando…" : "Cancelar carona"}
                    </motion.button>
                )}

                {/* ações rápidas */}
                <div className="mt-4 flex items-center justify-around">
                    <button className="grid h-14 w-14 place-items-center rounded-full bg-black text-white shadow active:scale-95">
                        <Phone className="h-7 w-7" />
                    </button>
                    <button className="grid h-14 w-14 place-items-center rounded-full bg-black text-white shadow active:scale-95">
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
