"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerifyClient({
    action,
    demoApprove,
}: {
    action: (fd: FormData) => Promise<any>;
    demoApprove: () => Promise<any>;
}) {
    const { back } = useRouter();
    const [sent, setSent] = useState(false);

    return (
        <div className="min-h-dvh w-full bg-white">
            <div className="pt-[env(safe-area-inset-top)]" />

            <header className="sticky top-[env(safe-area-inset-top)] z-40 flex h-12 items-center bg-[#0D74CE] px-3 text-white">
                <button className="rounded-md p-1 hover:bg-white/10" onClick={back}>
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="mx-auto font-semibold text-sm">Torne-se motorista</h1>
                <div className="w-6" />
            </header>

            {sent ? (
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 pt-10 text-center"
                    initial={{ opacity: 0, y: 8 }}
                >
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                    <h2 className="font-semibold text-lg">Solicitação enviada!</h2>
                    <button
                        className="mt-2 rounded-md bg-slate-100 px-4 py-2 text-sm"
                        onClick={() => back()}
                    >
                        Voltar
                    </button>
                </motion.div>
            ) : (
                <motion.form
                    action={async (fd) => {
                        await action(fd); // Server Action recebida via props
                        setSent(true);
                    }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto w-full max-w-md space-y-4 px-5 pt-4 pb-28"
                    initial={{ opacity: 0, y: 8 }}
                >
                    <Field name="licenseNumber" placeholder="CNH (nº)" />
                    <Field name="vehicleModel" placeholder="Modelo (ex: HB20)" />
                    <Field name="plate" placeholder="Placa (ex: ABC-1D23)" />

                    <button className="w-full rounded-md bg-[#0D74CE] py-3 font-semibold text-white shadow">
                        Enviar para análise
                    </button>

                    {/* Botão de DEMO funcionando (sem forms aninhados) */}
                    <button
                        className="text-slate-500 text-xs underline"
                        formAction={demoApprove}
                        type="submit"
                    >
                        [Demo] Aprovar agora
                    </button>
                </motion.form>
            )}
        </div>
    );
}

function Field(props: any) {
    return (
        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
            <input className="h-11 w-full bg-transparent outline-none" {...props} />
        </label>
    );
}
