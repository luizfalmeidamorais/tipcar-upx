"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Clock, Users, StickyNote, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewRideForm({ action }: { action: (fd: FormData) => Promise<any> }) {
    const { back, push } = useRouter();
    const [pending, startTransition] = useTransition();
    const [err, setErr] = useState<string | null>(null);

    return (
        <div className="min-h-dvh w-full bg-white">
            <header className="sticky top-[env(safe-area-inset-top)] z-40 flex h-12 items-center bg-[#0D74CE] px-3 text-white">
                <button onClick={() => back()} className="rounded-md p-1 hover:bg-white/10"><ArrowLeft className="h-6 w-6" /></button>
                <h1 className="mx-auto text-sm font-semibold">Cadastrar nova carona</h1>
                <div className="w-6" />
            </header>

            <form
                action={(fd) => {
                    setErr(null);
                    startTransition(async () => {
                        try {
                            await action(fd);
                            push("/rides");
                        } catch (e: any) {
                            setErr(e?.message ?? "Erro ao criar carona.");
                        }
                    });
                }}
                className="mx-auto w-full max-w-md px-5 pb-28 pt-4 space-y-4"
            >
                <Field name="originName" icon={<MapPin className="h-4 w-4 text-slate-500" />} placeholder="Origem (ex: Campus)" required />
                <input type="hidden" name="originLat" value="-23.533" />
                <input type="hidden" name="originLng" value="-46.625" />

                <Field name="destName" icon={<MapPin className="h-4 w-4 text-slate-500" />} placeholder="Destino (ex: Centro)" required />
                <input type="hidden" name="destLat" value="-23.550" />
                <input type="hidden" name="destLng" value="-46.640" />

                <div className="grid grid-cols-2 gap-3">
                    <Field name="departAt" type="datetime-local" required />
                    <Field name="priceCents" type="number" min={0} placeholder="Preço (centavos)" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field name="seatsTotal" type="number" min={1} max={6} icon={<Users className="h-4 w-4 text-slate-500" />} placeholder="Vagas" required />
                    <Field name="note" icon={<StickyNote className="h-4 w-4 text-slate-500" />} placeholder="Observação (opcional)" />
                </div>

                {err && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{err}</p>}

                <motion.button whileTap={{ scale: 0.98 }} disabled={pending}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0D74CE] py-3 font-semibold text-white shadow">
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />} Publicar carona
                </motion.button>
            </form>
        </div>
    );
}

function Field(props: any) {
    const { icon, ...rest } = props;
    return (
        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
            {icon}
            <input className="h-11 w-full bg-transparent outline-none" {...rest} />
        </label>
    );
}
