'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function VerifyClient({ action, demoApprove }: { action: (fd: FormData) => Promise<any>, demoApprove: () => Promise<any> }) {
    const { back } = useRouter()
    const [sent, setSent] = useState(false)

    return (
        <div className="min-h-dvh w-full bg-white">
            <div className="pt-[env(safe-area-inset-top)]" />
            <header className="sticky top-[env(safe-area-inset-top)] z-40 flex h-12 items-center bg-[#0D74CE] px-3 text-white">
                <button onClick={back} className="rounded-md p-1 hover:bg-white/10"><ArrowLeft className="h-6 w-6" /></button>
                <h1 className="mx-auto text-sm font-semibold">Torne-se motorista</h1>
                <div className="w-6" />
            </header>

            {!sent ? (
                <motion.form
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="mx-auto w-full max-w-md px-5 pb-28 pt-4 space-y-4"
                    action={async (fd) => {            // 👇 sem 'use server'
                        await action(fd)                 // chama a Server Action recebida via props
                        setSent(true)                    // atualiza o estado no cliente
                    }}
                >
                    <Field name="licenseNumber" placeholder="CNH (nº)" />
                    <Field name="vehicleModel" placeholder="Modelo (ex: HB20)" />
                    <Field name="plate" placeholder="Placa (ex: ABC-1D23)" />
                    <button className="w-full rounded-md bg-[#0D74CE] py-3 font-semibold text-white shadow">Enviar para análise</button>

                    {/* atalho de demo para aprovar */}
                    <form action={demoApprove}><button className="text-xs text-slate-500 underline">[Demo] Aprovar agora</button></form>
                </motion.form>
            ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 pt-10 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                    <h2 className="text-lg font-semibold">Solicitação enviada!</h2>
                    <button onClick={() => back()} className="mt-2 rounded-md bg-slate-100 px-4 py-2 text-sm">Voltar</button>
                </motion.div>
            )}
        </div>
    )
}

function Field(props: any) {
    return (
        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
            <input className="h-11 w-full bg-transparent outline-none" {...props} />
        </label>
    )
}
