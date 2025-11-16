"use client";

import { motion } from "framer-motion";
import { Settings, IdCard, Store, Coins, CarFront, Inbox, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileClient({
    name,
    subtitle,
    points,
    isDriverApproved,
}: {
    name: string;
    subtitle: string;
    points: number;
    isDriverApproved: boolean;
}) {
    const { push } = useRouter();

    return (
        <div className="min-h-dvh w-full bg-white">
            <div className="pt-[env(safe-area-inset-top)]" />
            <motion.header
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-[env(safe-area-inset-top)] z-40 bg-[#0D74CE] py-3 text-center text-white shadow"
            >
                <h1 className="text-base font-semibold">Sua Conta</h1>
            </motion.header>

            <main className="px-5 pt-5 pb-24">
                <section className="flex items-center gap-4">
                    <div className="relative">
                        <div className="grid h-20 w-20 place-items-center rounded-full bg-gray-300">
                            <svg viewBox="0 0 24 24" className="h-12 w-12 text-gray-600">
                                <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z" />
                            </svg>
                        </div>
                        <span className="absolute -right-2 -bottom-2 rounded-full bg-yellow-400 px-2 py-0.5 text-[10px] font-bold text-black tabular-nums">
                            {String(points).padStart(3, "0")}
                        </span>
                    </div>
                    <div>
                        <p className="text-xl font-semibold">{name}</p>
                        <p className="text-sm text-gray-600 leading-snug">{subtitle}</p>
                    </div>
                </section>

                <section className="mt-6 grid gap-3">
                    <Option icon={<Settings className="h-5 w-5" />} label="Configurações" onClick={() => push("/settings")} />
                    <Option icon={<IdCard className="h-5 w-5" />} label="Informações da conta" onClick={() => push("/profile/info")} />
                    <Option icon={<Store className="h-5 w-5" />} label="Loja de troca" onClick={() => push("/store")} />
                    <Option icon={<Coins className="h-5 w-5" />} label="Carteira de pontos" onClick={() => push("/wallet")} />

                    {!isDriverApproved ? (
                        <Option icon={<CarFront className="h-5 w-5" />} label="Quero ser motorista" onClick={() => push("/driver/verify")} />
                    ) : (
                        <>
                            <Option icon={<Plus className="h-5 w-5" />} label="Criar carona" onClick={() => push("/driver/rides/new")} />
                            <Option icon={<Inbox className="h-5 w-5" />} label="Solicitações recebidas" onClick={() => push("/driver/requests")} />
                        </>
                    )}
                </section>
            </main>

            <div className="pb-[env(safe-area-inset-bottom)] h-24" />
        </div>
    );
}

function Option({ icon, label, onClick }: any) {
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left shadow-sm"
        >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-[#0D74CE] shadow-inner">{icon}</span>
            <span className="text-[15px] font-semibold text-gray-800">{label}</span>
        </motion.button>
    );
}
