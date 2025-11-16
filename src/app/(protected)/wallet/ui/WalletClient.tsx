"use client";
import { CircleDollarSign, Gift, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function WalletClient({
    balance,
    items,
}: {
    balance: number;
    items: { id: string; title: string; whenText: string; delta: number; kind: "points" | "redeem"; code?: string }[];
}) {
    const pad = (n: number) => n.toString().padStart(5, "0");
    return (
        <div className="min-h-dvh w-full bg-white">
            <div className="pt-[env(safe-area-inset-top)]" />
            <header className="sticky top-[env(safe-area-inset-top)] z-40 flex items-center justify-between bg-[#0D74CE] px-4 py-3 text-white">
                <h1 className="text-base font-semibold">Carteira</h1>
                <div className="inline-flex items-center gap-2 font-semibold">
                    <span className="tabular-nums tracking-widest">{pad(balance)}</span>
                    <CircleDollarSign className="h-5 w-5 text-yellow-300" />
                </div>
            </header>

            <h3 className="px-4 pb-2 pt-4 text-sm font-semibold text-slate-700">Extrato</h3>
            <ul className="divide-y">
                {items.map((t) => (
                    <li key={t.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100">
                                {t.kind === "redeem" ? (
                                    <Gift className="h-5 w-5 text-fuchsia-600" />
                                ) : t.delta > 0 ? (
                                    <ArrowDownCircle className="h-5 w-5 text-emerald-600" />
                                ) : (
                                    <ArrowUpCircle className="h-5 w-5 text-slate-600" />
                                )}
                            </span>
                            <div>
                                <p className="text-[15px] font-semibold text-slate-900">{t.title}</p>
                                <p className="text-xs text-slate-500">{t.whenText}{t.kind === "redeem" && t.code ? ` • Código: ${t.code}` : ""}</p>
                            </div>
                        </div>
                        <div className={`text-sm font-semibold ${t.delta > 0 ? "text-emerald-600" : "text-slate-800"}`}>
                            {t.delta > 0 ? "+" : "-"}
                            {Math.abs(t.delta)}
                            <CircleDollarSign className="ml-1 inline h-4 w-4 align-[-3px] text-yellow-500" />
                        </div>
                    </li>
                ))}
            </ul>

            <div className="pb-[env(safe-area-inset-bottom)] h-24" />
        </div>
    );
}
