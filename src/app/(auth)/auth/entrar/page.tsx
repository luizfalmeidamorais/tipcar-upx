"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import { authCLient } from "@/lib/auth-client";
import InstallAppCTA from "@/components/pwa/InstallAppCTS";

export default function Page() {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setLoading(true);

        const { error } = await authCLient.signIn.email({
            email,
            password: pass,
        });

        setLoading(false);

        if (error) {
            setErr(error.message ?? "Email ou senha inválidos.");
            return;
        }

        router.push("/"); // pós-login
    }

    return (
        <div className="min-h-dvh w-full bg-gradient-to-b from-[#003a8c] via-[#004AAD] to-[#003a8c]">
            <div className="pt-[env(safe-area-inset-top)]" />
            <main className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-md flex-col justify-center px-5">
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <header className="text-center text-white">
                        <h1 className="text-2xl font-semibold">Bem-vindo(a)</h1>
                        <p className="text-sm text-white/80">Faça login para continuar</p>
                    </header>

                    <section className="rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur">
                        <form onSubmit={handleSubmit}>
                            <label className="mb-3 block text-sm font-medium text-slate-700">Email</label>
                            <div className="mb-4 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
                                <Mail className="h-4 w-4 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="h-11 w-full bg-transparent outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <label className="mb-3 block text-sm font-medium text-slate-700">Senha</label>
                            <div className="mb-2 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
                                <Lock className="h-4 w-4 text-slate-500" />
                                <input
                                    type={show ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-11 w-full bg-transparent outline-none"
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                />
                                <button type="button" onClick={() => setShow(s => !s)} className="p-1 text-slate-500">
                                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>

                            {err && <p className="mb-3 text-sm text-red-600">{err}</p>}

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#0D74CE] py-3 font-semibold text-white shadow disabled:opacity-60"
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? "Entrando..." : <>Entrar <ChevronRight className="h-4 w-4" /></>}
                            </motion.button>
                        </form>
                    </section>

                    <p className="text-center text-sm text-white/90">
                        Não tem conta? <a href="/signup" className="font-semibold underline">Cadastrar</a>
                    </p>

                    <InstallAppCTA className="mt-6" />
                </motion.div>
            </main>
            <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
    );
}
