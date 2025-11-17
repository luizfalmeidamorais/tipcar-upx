"use client";

import { motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    Loader2,
    MapPin,
    StickyNote,
    Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function NewRideForm({
    action,
}: {
    action: (fd: FormData) => Promise<{ id: string }>;
}) {
    const { back, push } = useRouter();
    const [pending, startTransition] = useTransition();
    const [err, setErr] = useState<string | null>(null);
    const [createdId, setCreatedId] = useState<string | null>(null); // <- NOVO

    if (createdId) {
        return (
            <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 bg-white px-5 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-600" />
                <h2 className="font-semibold text-xl">Carona criada!</h2>

                <button
                    className="rounded-md bg-[#0D74CE] px-4 py-2 font-semibold text-white shadow"
                    onClick={() => push(`/explore/${createdId}`)}
                >
                    Ver carona
                </button>

                <button
                    className="mt-2 text-[#0D74CE] text-sm underline"
                    onClick={() => push("/explore")}
                >
                    Ir para explorar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-dvh w-full bg-white">
            <header className="sticky top-[env(safe-area-inset-top)] z-40 flex h-12 items-center bg-[#0D74CE] px-3 text-white">
                <button
                    className="rounded-md p-1 hover:bg-white/10"
                    onClick={() => back()}
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="mx-auto font-semibold text-sm">Cadastrar nova carona</h1>
                <div className="w-6" />
            </header>

            <form
                action={(fd) => {
                    setErr(null);
                    startTransition(async () => {
                        try {
                            const res = await action(fd); // <- devolve {id}
                            setCreatedId(res.id); // <- mostrar a tela de sucesso
                        } catch (e: any) {
                            setErr(e?.message ?? "Erro ao criar carona.");
                        }
                    });
                }}
                className="mx-auto w-full max-w-md space-y-4 px-5 pt-4 pb-28"
            >
                <Field
                    icon={<MapPin className="h-4 w-4 text-slate-500" />}
                    name="originName"
                    placeholder="Origem (ex: Campus)"
                    required
                />
                <input name="originLat" type="hidden" value="-23.533" />
                <input name="originLng" type="hidden" value="-46.625" />

                <Field
                    icon={<MapPin className="h-4 w-4 text-slate-500" />}
                    name="destName"
                    placeholder="Destino (ex: Centro)"
                    required
                />
                <input name="destLat" type="hidden" value="-23.550" />
                <input name="destLng" type="hidden" value="-46.640" />

                <div className="grid grid-cols-2 gap-3">
                    <Field name="departAt" required type="datetime-local" />
                    <Field
                        name="priceReais"
                        placeholder="Preço por pessoa (ex: 3,17)"
                        required
                        type="text"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Field
                        icon={<Users className="h-4 w-4 text-slate-500" />}
                        max={6}
                        min={1}
                        name="seatsTotal"
                        placeholder="Vagas"
                        required
                        type="number"
                    />
                    <Field
                        icon={<StickyNote className="h-4 w-4 text-slate-500" />}
                        name="note"
                        placeholder="Observação (opcional)"
                    />
                </div>

                {err && (
                    <p className="rounded-md bg-red-50 p-2 text-red-700 text-sm">{err}</p>
                )}

                <motion.button
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0D74CE] py-3 font-semibold text-white shadow"
                    disabled={pending}
                    whileTap={{ scale: 0.98 }}
                >
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />} Publicar
                    carona
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
