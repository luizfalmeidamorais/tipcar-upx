// components/BottomNavClient.tsx
"use client";

import {
    Bot,
    Home,
    Inbox,
    MapPin,
    PlusCircle,
    Store,
    User,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavClient({ approved }: { approved: boolean }) {
    const p = usePathname();

    // defina aqui os atalhos que você quer no nav
    const items = [
        { href: "/", label: "Início", icon: Home, show: true },
        { href: "/explore", label: "Caronas", icon: MapPin, show: true },
        {
            href: "/driver/rides/new",
            label: "Criar",
            icon: PlusCircle,
            show: approved,
        }, // só motorista aprovado
        {
            href: "/driver/requests",
            label: "Solicitações",
            icon: Inbox,
            show: approved,
        }, // só motorista aprovado
        { href: "/store", label: "Loja", icon: Store, show: true },
        { href: "/wallet", label: "Carteira", icon: Wallet, show: true },
        { href: "/profile", label: "Perfil", icon: User, show: true },
        { href: "/jarvis", label: "Jarvis", icon: Bot, show: true },
    ].filter((i) => i.show);

    return (
        <footer className="fixed inset-x-0 bottom-0 z-40">
            <div className="h-[2px] w-full bg-gray-300" />
            <div className="bg-white py-3">
                <nav className="mx-auto flex w-full max-w-3xl items-end justify-around px-2">
                    {items.map(({ href, label, icon: Icon }) => {
                        const active = p === href || p.startsWith(href + "/");
                        return (
                            <Link
                                aria-label={label}
                                className={`group flex h-12 w-12 items-center justify-center rounded-full shadow-md transition ${active ? "bg-[#0D74CE]" : "bg-[#0D74CE]/70 hover:bg-[#0D74CE]"}`}
                                href={href}
                                key={href}
                            >
                                <Icon className="h-6 w-6 text-white" />
                            </Link>
                        );
                    })}
                </nav>

                {/* “home indicator” estilo iOS */}
                <div className="mt-3 flex justify-center">
                    <div className="h-1.5 w-28 rounded-full bg-gray-400" />
                </div>
            </div>
            {/* safe-area para iOS */}
            <div className="pb-[env(safe-area-inset-bottom)]" />
        </footer>
    );
}
