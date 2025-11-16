"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Car, UserPlus, LogIn } from "lucide-react";

export default function Page() {
    const { push } = useRouter();

    return (
        <div className="min-h-dvh w-full bg-gradient-to-b from-[#003a8c] via-[#004AAD] to-[#003a8c] text-white">
            <div className="pt-[env(safe-area-inset-top)]" />
            <main className="flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-5"
                >
                    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm shadow">
                        <Car className="h-4 w-4" /> <span>Sua jornada começa aqui</span>
                    </div>

                    <h1 className="text-5xl font-extrabold tracking-[0.22em] drop-shadow-sm">TIPCAR</h1>

                    <motion.img
                        src="/assets/car-transparent.png"
                        alt="Carro"
                        className="w-full max-w-sm select-none"
                        draggable={false}
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
                        transition={{ duration: 0.6, ease: "easeOut", repeat: Infinity, repeatDelay: 1.5 }}
                    />

                    <p className="text-center text-white/90">Compartilhe caronas com segurança e economia.</p>

                    <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => push("/signup")}
                            className="w-full rounded-full bg-white py-3 font-semibold text-[#0D74CE] shadow"
                        >
                            <span className="inline-flex items-center justify-center gap-2">
                                <UserPlus className="h-5 w-5" /> Cadastrar
                            </span>
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => push("/login")}
                            className="w-full rounded-full bg-white/15 py-3 font-semibold text-white ring-1 ring-white/40 backdrop-blur"
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
