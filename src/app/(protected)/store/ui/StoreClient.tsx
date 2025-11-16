"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { CircleDollarSign, ArrowRight, Percent, Loader2 } from "lucide-react";

export default function StoreClient({ offers, balance, action }: any) {
    const [bal, setBal] = useState(balance);
    const [pending, start] = useTransition();
    const [msg, setMsg] = useState<string | null>(null);
    const pad = (n: number) => n.toString().padStart(5, "0");

    const redeem = (offer: any) => {
        const fd = new FormData();
        fd.set("offerId", offer.id);
        setMsg(null);
        start(async () => {
            try {
                await action(fd);
                setBal((b: number) => b - offer.cost);
                setMsg(`Resgate em ${offer.partner} concluído!`);
            } catch (e: any) {
                setMsg(e?.message ?? "Falha no resgate.");
            }
        });
    };

    return (
        <div className="min-h-dvh w-full bg-white">
            <header className="sticky top-[env(safe-area-inset-top)] z-40 flex items-center justify-between bg-[#0D74CE] px-4 py-3 text-white">
                <h1 className="text-base font-semibold">Loja de Troca</h1>
                <div className="inline-flex items-center gap-2 font-semibold">
                    <span className="tabular-nums tracking-widest">{pad(bal)}</span>
                    <CircleDollarSign className="h-5 w-5 text-yellow-300" />
                </div>
            </header>

            {msg && <p className="mx-4 mt-2 rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{msg}</p>}

            <ul className="divide-y">
                {offers.map((o: any, i: number) => (
                    <motion.li key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="flex items-center justify-between px-4 py-4">
                        <div>
                            <p className="text-[15px] font-semibold text-slate-900">{o.partner}</p>
                            <p className="mt-0.5 text-xs text-slate-500">Ofertas e benefícios</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="tabular-nums">{o.cost}</span>
                                <CircleDollarSign className="h-5 w-5 text-yellow-500" />
                            </div>
                            <span className="text-slate-500">→</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs">
                                <Percent className="h-3.5 w-3.5" /> {o.cashbackPct}%
                            </span>
                            <button disabled={pending || bal < o.cost} onClick={() => redeem(o)}
                                className="rounded-md bg-[#0D74CE] px-3 py-2 text-sm font-semibold text-white shadow inline-flex items-center gap-2 disabled:opacity-50">
                                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Resgatar <ArrowRight className="h-4 w-4" /></>}
                            </button>
                        </div>
                    </motion.li>
                ))}
            </ul>

            <div className="pb-[env(safe-area-inset-bottom)] h-24" />
        </div>
    );
}
