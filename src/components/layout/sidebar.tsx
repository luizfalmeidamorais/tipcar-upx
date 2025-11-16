"use client";
import { Button } from "@heroui/react";
import { useState } from "react";

export default function Sidebar({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="flex gap-4">
            <aside
                className={`${open ? "translate-x-0" : "-translate-x-full"} fixed top-0 left-0 z-50 h-dvh w-64 bg-black/60 p-4 backdrop-blur transition md:static md:w-56 md:translate-x-0 md:border-white/10 md:border-r md:bg-transparent`}
            >
                <nav className="grid gap-2">
                    <a href="/app/dashboard">Dashboard</a>
                    <a href="/app/rider/request">Solicitar</a>
                    <a href="/app/driver/queue">Motorista</a>
                    <a href="/app/profile">Perfil</a>
                    <a href="/admin">Admin</a>
                </nav>
            </aside>
            <main className="flex-1 md:pl-4">
                <Button className="mb-2 md:hidden" onPress={() => setOpen(!open)}>
                    {open ? "Fechar" : "Menu"}
                </Button>
                {children}
            </main>
        </div>
    );
}
