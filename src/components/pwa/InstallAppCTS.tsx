"use client";

import { useState } from "react";
import { usePWAInstall } from "./usePWAInstall";
import { Download, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstallAppCTA({ className = "" }: { className?: string }) {
    const { canPrompt, promptInstall, isStandalone, isIOS, isEligibleBrowser } = usePWAInstall();
    const [msg, setMsg] = useState<string | null>(null);
    const [showIOS, setShowIOS] = useState(false);

    if (isStandalone) return null; // já instalado → não mostra

    const showInstallButton = isEligibleBrowser && canPrompt;
    const showIOSButton = isIOS; // iOS não tem prompt → mostrar instruções

    if (!showInstallButton && !showIOSButton) return null;

    return (
        <div className={`mt-3 ${className}`}>
            {/* Botão para Chromium (Android/desktop) */}
            {showInstallButton && (
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                        const res = await promptInstall();
                        if (res.outcome === "accepted") setMsg("Instalação iniciada ✅");
                        else setMsg("Instalação cancelada");
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#0D74CE] px-3 py-2 text-white font-semibold shadow"
                >
                    <Download className="h-5 w-5" />
                    Instalar app
                </motion.button>
            )}

            {/* Botão para iOS com instruções */}
            {showIOSButton && (
                <>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowIOS(true)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-black px-3 py-2 text-white font-semibold shadow"
                    >
                        <Info className="h-5 w-5" />
                        Como instalar no iPhone
                    </motion.button>

                    <AnimatePresence>
                        {showIOS && (
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                className="mt-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
                            >
                                <p className="font-semibold mb-1">Adicionar à Tela de Início (iOS)</p>
                                <ol className="list-decimal ml-5 space-y-1">
                                    <li>Toque no botão <span className="font-semibold">Compartilhar</span> (ícone com seta ↑).</li>
                                    <li>Desça a lista e toque em <span className="font-semibold">Adicionar à Tela de Início</span>.</li>
                                    <li>Confirme em <span className="font-semibold">Adicionar</span>.</li>
                                </ol>
                                <div className="text-right">
                                    <button
                                        onClick={() => setShowIOS(false)}
                                        className="mt-2 text-xs text-slate-500 underline"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}
        </div>
    );
}
