"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronRight,
    Clock,
    Filter,
    Loader2,
    MapPin,
    Search,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { formatDateTimeBR } from "@/lib/datetime";

type Item = {
    id: string;
    driverId: string;

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
    requestStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
    rideStatus: "OPEN" | "CANCELLED" | "COMPLETED";

    km?: number | null;
};

export default function ExploreClient({
    initial,
    action,
}: {
    initial: { items: Item[] };
    action: (fd: FormData) => Promise<{ items: Item[] }>;
}) {
    const { push } = useRouter();

    const [q, setQ] = useState("");
    const [near, setNear] = useState(true);
    const [items, setItems] = useState<Item[]>(initial.items);
    const [pending, startTransition] = useTransition();

    const latRef = useRef<number | null>(null);
    const lngRef = useRef<number | null>(null);

    useEffect(() => {
        if (!("geolocation" in navigator)) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                latRef.current = pos.coords.latitude;
                lngRef.current = pos.coords.longitude;
                fetchList();
            },
            () => {
                // erro de geolocalização → mantém lista inicial
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 30_000 }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function fetchList() {
        const fd = new FormData();
        fd.set("q", q);
        fd.set("near", String(near));
        if (latRef.current != null) fd.set("lat", String(latRef.current));
        if (lngRef.current != null) fd.set("lng", String(lngRef.current));

        startTransition(async () => {
            const res = await action(fd);
            setItems(res.items);
        });
    }

    return (
        <div className="min-h-dvh w-full bg-white">
            {/* HEADER */}
            <header className="sticky top-[env(safe-area-inset-top)] z-40 bg-[#0D74CE] px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                    <h1 className="font-semibold text-base">Explorar caronas</h1>

                    <button
                        className="rounded-md bg-white/15 px-3 py-1 text-white"
                        onClick={() => {
                            setNear((s) => !s);
                            setTimeout(fetchList, 0);
                        }}
                    >
                        <Filter className="-mt-1 mr-1 inline h-4 w-4" />
                        {near ? "Perto" : "Todos"}
                    </button>
                </div>

                <div className="mt-2 flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 backdrop-blur">
                    <Search className="h-4 w-4 text-white/90" />
                    <input
                        className="h-10 w-full bg-transparent text-sm placeholder-white/70 outline-none"
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchList()}
                        placeholder="Buscar origem, destino, horário..."
                        value={q}
                    />
                    <button
                        className="rounded bg-white/15 px-2 py-1 text-xs"
                        onClick={fetchList}
                    >
                        Buscar
                    </button>
                </div>
            </header>

            {/* LOADING */}
            {pending && (
                <div className="flex items-center justify-center py-2 text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando…
                </div>
            )}

            {/* LISTA */}
            <ul className="divide-y">
                <AnimatePresence initial={false}>
                    {items.map((r, i) => {
                        const disabled = r.rideStatus !== "OPEN";

                        let statusLabel: string | null = null;
                        if (r.rideStatus === "CANCELLED") {
                            statusLabel = "Carona cancelada";
                        } else if (r.isDriver) {
                            statusLabel = "Você é o motorista";
                        } else if (r.isPassenger) {
                            statusLabel = "Você está nesta carona";
                        } else if (r.requestStatus === "PENDING") {
                            statusLabel = "Aguardando aprovação…";
                        }

                        return (
                            <motion.li
                                animate={{ opacity: disabled ? 0.45 : 1, y: 0 }}
                                className={`flex items-center gap-3 px-4 py-3 ${disabled ? "pointer-events-none" : "active:bg-slate-50"
                                    }`}
                                initial={{ opacity: 0, y: 6 }}
                                key={r.id}
                                onClick={() => {
                                    if (!disabled) push(`/explore/${r.id}`);
                                }}
                                transition={{ duration: 0.2, delay: i * 0.02 }}
                            >
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
                                    <MapPin className="h-5 w-5 text-[#0D74CE]" />
                                </div>

                                <div className="flex-1">
                                    <p className="font-semibold text-[15px] text-slate-900">
                                        {r.originName} → {r.destName}
                                    </p>

                                    {statusLabel && (
                                        <p className="mt-0.5 font-semibold text-[#0D74CE] text-xs">
                                            {statusLabel}
                                        </p>
                                    )}

                                    <p className="text-slate-500 text-xs">
                                        <Clock className="-mt-0.5 mr-1 inline h-3.5 w-3.5" />
                                        {formatDateTimeBR(r.departAt)} •{" "}
                                        <Users className="-mt-0.5 mx-1 inline h-3.5 w-3.5" />
                                        {r.seatsAvail}/{r.seatsTotal}{" "}
                                        {r.km != null && <>• {r.km.toFixed(1)} km</>}
                                    </p>
                                </div>

                                {!disabled && (
                                    <ChevronRight className="h-5 w-5 text-slate-400" />
                                )}
                            </motion.li>
                        );
                    })}
                </AnimatePresence>

                {items.length === 0 && (
                    <li className="px-4 py-10 text-center text-slate-500 text-sm">
                        Sem caronas.
                    </li>
                )}
            </ul>

            <div className="h-24 pb-[env(safe-area-inset-bottom)]" />
        </div>
    );
}
