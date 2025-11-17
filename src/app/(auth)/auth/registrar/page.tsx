"use client";

import { motion } from "framer-motion";
import {
    ChevronRight,
    Eye,
    EyeOff,
    IdCard,
    Lock,
    Mail,
    Phone,
    User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

        if (!(name && email && pass && pass2)) {
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
            name, // campo padrão suportado
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
                <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                    initial={{ opacity: 0, y: 14 }}
                >
                    <header className="text-center text-white">
                        <h1 className="font-semibold text-2xl">Criar conta</h1>
                        <p className="text-sm text-white/80">Preencha seus dados</p>
                    </header>

                    <section className="space-y-4 rounded-2xl bg-white/95 p-5 shadow-xl backdrop-blur">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <Field
                                icon={<User className="h-4 w-4 text-slate-500" />}
                                onChange={setName}
                                placeholder="Nome completo"
                                value={name}
                            />
                            <Field
                                icon={<Phone className="h-4 w-4 text-slate-500" />}
                                onChange={setPhone}
                                placeholder="(11) 98765-4321"
                                type="tel"
                                value={phone}
                            />
                            <Field
                                icon={<IdCard className="h-4 w-4 text-slate-500" />}
                                onChange={setCpf}
                                placeholder="000.000.000-00"
                                value={cpf}
                            />
                            <Field
                                icon={<Mail className="h-4 w-4 text-slate-500" />}
                                onChange={setEmail}
                                placeholder="seu@email.com"
                                type="email"
                                value={email}
                            />
                            <Field
                                end={
                                    <button onClick={() => setShow((s) => !s)} type="button">
                                        {show ? (
                                            <EyeOff className="h-4 w-4 text-slate-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-500" />
                                        )}
                                    </button>
                                }
                                icon={<Lock className="h-4 w-4 text-slate-500" />}
                                onChange={setPass}
                                placeholder="Senha"
                                type={show ? "text" : "password"}
                                value={pass}
                            />
                            <Field
                                end={
                                    <button onClick={() => setShow2((s) => !s)} type="button">
                                        {show2 ? (
                                            <EyeOff className="h-4 w-4 text-slate-500" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-slate-500" />
                                        )}
                                    </button>
                                }
                                icon={<Lock className="h-4 w-4 text-slate-500" />}
                                onChange={setPass2}
                                placeholder="Confirmar senha"
                                type={show2 ? "text" : "password"}
                                value={pass2}
                            />

                            {err && <p className="text-red-600 text-sm">{err}</p>}

                            <motion.button
                                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0D74CE] py-3 font-semibold text-white shadow disabled:opacity-60"
                                disabled={loading}
                                type="submit"
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    "Cadastrando..."
                                ) : (
                                    <>
                                        Cadastrar <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </section>

                    <p className="text-center text-sm text-white/90">
                        Já tem conta?{" "}
                        <a className="font-semibold underline" href="/auth/entrar">
                            Entrar
                        </a>
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
                className="h-11 w-full bg-transparent outline-none"
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                type={type}
                value={value}
            />
            {end}
        </div>
    );
}
