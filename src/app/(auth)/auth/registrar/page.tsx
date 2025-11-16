"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Phone, IdCard, Mail, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import { authCLient } from "@/lib/auth-client";

export default function Page() {
    const [show, setShow] = useState(false);
    const [show2, setShow2] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [pass2, setPass2] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);

        if (!name || !email || !pass || !pass2) {
            setErr("Preencha os campos obrigatórios.");
            return;
        }
        if (pass !== pass2) {
            setErr("As senhas não conferem.");
            return;
        }

        setLoading(true);
        const { error } = await authCLient.signUp.email({
            email,
            password: pass,
            name,                     // campo padrão suportado
            // Você pode persistir phone/cpf via "user metadata" no server (ex.: plugin/profile)
        });

        setLoading(false);

        if (error) {
            setErr(error.message ?? "Não foi possível criar sua conta.");
            return;
        }

        // Usuário autenticado com cookie de sessão setado
        router.push("/"); // ajuste destino
    }

    return (
        <div className="min-h-dvh w-full bg-gradient-to-b from-[#003a8c] via-[#004AAD] to-[#003a8c]">
            <div className="pt-[env(safe-area-inset-top)]" />
            <main className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-md flex-col justify-center px-5">
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <header className="text-center text-white">
                        <h1 className="text-2xl font-semibold">Criar conta</h1>
                        <p className="text-sm text-white/80">Preencha seus dados</p>
                    </header>

                    <section className="rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field icon={<User className="h-4 w-4 text-slate-500" />} placeholder="Nome completo" value={name} onChange={setName} />
                            <Field icon={<Phone className="h-4 w-4 text-slate-500" />} placeholder="(11) 98765-4321" type="tel" value={phone} onChange={setPhone} />
                            <Field icon={<IdCard className="h-4 w-4 text-slate-500" />} placeholder="000.000.000-00" value={cpf} onChange={setCpf} />
                            <Field icon={<Mail className="h-4 w-4 text-slate-500" />} placeholder="seu@email.com" type="email" value={email} onChange={setEmail} />
                            <Field
                                icon={<Lock className="h-4 w-4 text-slate-500" />}
                                type={show ? "text" : "password"}
                                placeholder="Senha"
                                end={<button type="button" onClick={() => setShow(s => !s)}>{show ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}</button>}
                                value={pass}
                                onChange={setPass}
                            />
                            <Field
                                icon={<Lock className="h-4 w-4 text-slate-500" />}
                                type={show2 ? "text" : "password"}
                                placeholder="Confirmar senha"
                                end={<button type="button" onClick={() => setShow2(s => !s)}>{show2 ? <EyeOff className="h-4 w-4 text-slate-500" /> : <Eye className="h-4 w-4 text-slate-500" />}</button>}
                                value={pass2}
                                onChange={setPass2}
                            />

                            {err && <p className="text-sm text-red-600">{err}</p>}

                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                className="w-full rounded-md bg-[#0D74CE] py-3 font-semibold text-white shadow inline-flex items-center justify-center gap-2 disabled:opacity-60"
                                type="submit"
                            >
                                {loading ? "Cadastrando..." : <>Cadastrar <ChevronRight className="h-4 w-4" /></>}
                            </motion.button>
                        </form>
                    </section>

                    <p className="text-center text-sm text-white/90">
                        Já tem conta? <a href="/login" className="font-semibold underline">Entrar</a>
                    </p>
                </motion.div>
            </main>
            <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
    );
}

function Field({
    icon,
    end,
    placeholder,
    type = "text",
    value,
    onChange,
}: {
    icon?: React.ReactNode;
    end?: React.ReactNode;
    placeholder?: string;
    type?: string;
    value?: string;
    onChange?: (v: string) => void;
}) {
    return (
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3">
            {icon}
            <input
                placeholder={placeholder}
                type={type}
                className="h-11 w-full bg-transparent outline-none"
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
            />
            {end}
        </div>
    );
}
