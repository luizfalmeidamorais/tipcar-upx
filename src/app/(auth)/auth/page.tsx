"use client";

import { motion } from "framer-motion";
import { Car, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
    const { push } = useRouter();

    return (
        <div className="min-h-dvh w-full bg-gradient-to-b from-[#003a8c] via-[#004AAD] to-[#003a8c] text-white">
            <div className="pt-[env(safe-area-inset-top)]" />
            <main className="flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center px-6">
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-5"
                    initial={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm shadow">
                        <Car className="h-4 w-4" /> <span>Sua jornada começa aqui</span>
                    </div>

                    <h1 className="font-extrabold text-5xl tracking-[0.22em] drop-shadow-sm">
                        TIPCAR
                    </h1>

                    <p className="text-center text-white/90">
                        Compartilhe caronas com segurança e economia.
                    </p>

                    <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
                        <motion.button
                            className="w-full rounded-full bg-white py-3 font-semibold text-[#0D74CE] shadow"
                            onClick={() => push("/auth/registrar")}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                <UserPlus className="h-5 w-5" /> Cadastrar
                            </span>
                        </motion.button>
                        <motion.button
                            className="w-full rounded-full bg-white/15 py-3 font-semibold text-white ring-1 ring-white/40 backdrop-blur"
                            onClick={() => push("/auth/entrar")}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                <LogIn className="h-5 w-5" /> Entrar
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
            </main>
            <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
    );
}
