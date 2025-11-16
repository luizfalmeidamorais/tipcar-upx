"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Search, Filter, ChevronRight, Users, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDateTimeBR } from "@/lib/datetime";

type Item = {
    id: string;
    originName: string; originLat: number; originLng: number;
    destName: string; destLat: number; destLng: number;
    departAt: string; seatsAvail: number; seatsTotal: number;
    driverId: string; km?: number | null;
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
    const latRef = useRef<number | undefined>(undefined);
    const lngRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!("geolocation" in navigator)) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => { latRef.current = pos.coords.latitude; lngRef.current = pos.coords.longitude; fetchList(); },
            () => fetchList(),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
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
            <header className="sticky top-[env(safe-area-inset-top)] z-40 bg-[#0D74CE] px-4 py-3 text-white">
                <div className="flex items-center justify-between">
                    <h1 className="text-base font-semibold">Explorar caronas</h1>
                    <button onClick={() => { setNear((s) => !s); setTimeout(fetchList, 0); }}
                        className="rounded-md bg-white/15 px-3 py-1 text-white">
                        <Filter className="mr-1 inline h-4 w-4 -mt-1" /> {near ? "Perto" : "Todos"}
                    </button>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 backdrop-blur">
                    <Search className="h-4 w-4 text-white/90" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchList()}
                        placeholder="Buscar origem, destino, horário..."
                        className="h-10 w-full bg-transparent text-sm placeholder-white/70 outline-none"
                    />
                    <button onClick={fetchList} className="rounded bg-white/15 px-2 py-1 text-xs">Buscar</button>
                </div>
            </header>

            {pending && <div className="flex items-center justify-center py-2 text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Atualizando…</div>}

            <ul className="divide-y">
                <AnimatePresence initial={false}>
                    {items.map((r, i) => (
                        <motion.li
                            key={r.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.02 }}
                            className="flex items-center gap-3 px-4 py-3 active:bg-slate-50"
                            onClick={() => push(`/explore/${r.id}`)}
                        >
                            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100">
                                <MapPin className="h-5 w-5 text-[#0D74CE]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[15px] font-semibold text-slate-900">{r.originName} → {r.destName}</p>
                                <p className="text-xs text-slate-500">
                                    <Clock className="mr-1 inline h-3.5 w-3.5 -mt-0.5" />
                                    {formatDateTimeBR(r.departAt)} • <Users className="mx-1 inline h-3.5 w-3.5 -mt-0.5" />
                                    {r.seatsAvail}/{r.seatsTotal} {r.km != null && <>• {r.km.toFixed(1)} km</>}
                                </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        </motion.li>
                    ))}
                </AnimatePresence>
                {items.length === 0 && <li className="px-4 py-10 text-center text-sm text-slate-500">Sem caronas.</li>}
            </ul>

            <div className="pb-[env(safe-area-inset-bottom)] h-24" />
        </div>
    );
}
