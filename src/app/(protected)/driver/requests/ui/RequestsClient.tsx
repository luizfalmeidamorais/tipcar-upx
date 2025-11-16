"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, MapPin, Clock, Loader2 } from "lucide-react";

export default function RequestsClient({ initial, action }: any) {
    const [items, setItems] = useState(initial);
    const [pending, start] = useTransition();
    const [err, setErr] = useState<string | null>(null);

    const act = (id: string, accept: boolean) => {
        const fd = new FormData();
        fd.set("requestId", id);
        fd.set("accept", String(accept));
        setErr(null);
        start(async () => {
            try {
                await action(fd);
                setItems((L: any[]) => L.filter((i) => i.id !== id));
            } catch (e: any) {
                setErr(e?.message ?? "Erro ao decidir.");
            }
        });
    };

    return (
        <div className="min-h-dvh w-full bg-white">
            <header className="sticky top-[env(safe-area-inset-top)] z-40 bg-[#0D74CE] px-4 py-3 text-white">
                <h1 className="text-base font-semibold">Solicitações recebidas</h1>
            </header>

            {err && <p className="mx-4 mt-2 rounded-md bg-red-50 p-2 text-sm text-red-700">{err}</p>}
            {pending && <p className="mx-4 mt-2 inline-flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Processando…</p>}

            <ul className="divide-y">
                <AnimatePresence initial={false}>
                    {items.map((r: any) => (
                        <motion.li key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            className="flex items-center gap-3 px-4 py-3">
                            <div className="flex-1">
                                <p className="text-[15px] font-semibold text-slate-900">{r.passenger.name}</p>
                                <p className="text-xs text-slate-500">
                                    <MapPin className="mr-1 inline h-3.5 w-3.5 -mt-0.5" />
                                    {r.ride.originName} → {r.ride.destName} • <Clock className="mx-1 inline h-3.5 w-3.5 -mt-0.5" />
                                    {new Date(r.ride.departAt).toLocaleString()}
                                </p>
                                {r.message && <p className="mt-1 text-xs text-slate-600">“{r.message}”</p>}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => act(r.id, false)} className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-red-600 shadow"><X className="h-5 w-5" /></button>
                                <button onClick={() => act(r.id, true)} className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-emerald-600 shadow"><Check className="h-5 w-5" /></button>
                            </div>
                        </motion.li>
                    ))}
                </AnimatePresence>
                {items.length === 0 && <li className="px-4 py-10 text-center text-sm text-slate-500">Sem solicitações.</li>}
            </ul>

            <div className="pb-[env(safe-area-inset-bottom)] h-24" />
        </div>
    );
}
