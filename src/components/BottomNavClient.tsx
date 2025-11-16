// components/BottomNavClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, PlusCircle, Inbox, Store, Wallet, User } from "lucide-react";

export default function BottomNavClient({ approved }: { approved: boolean }) {
    const p = usePathname();

    // defina aqui os atalhos que você quer no nav
    const items = [
        { href: "/", label: "Início", icon: Home, show: true },
        { href: "/explore", label: "Caronas", icon: MapPin, show: true },
        { href: "/driver/rides/new", label: "Criar", icon: PlusCircle, show: approved }, // só motorista aprovado
        { href: "/driver/requests", label: "Solicitações", icon: Inbox, show: approved }, // só motorista aprovado
        { href: "/store", label: "Loja", icon: Store, show: true },
        { href: "/wallet", label: "Carteira", icon: Wallet, show: true },
        { href: "/profile", label: "Perfil", icon: User, show: true },
    ].filter((i) => i.show);

    return (
        <footer className="fixed inset-x-0 bottom-0 z-40">
            <div className="h-[2px] w-full bg-gray-300" />
            <div className="bg-white py-3">
                <nav className="mx-auto w-full max-w-3xl flex items-end justify-around px-2">
                    {items.map(({ href, label, icon: Icon }) => {
                        const active = p === href || p.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`group w-12 h-12 rounded-full flex items-center justify-center shadow-md transition
                  ${active ? "bg-[#0D74CE]" : "bg-[#0D74CE]/70 hover:bg-[#0D74CE]"}`}
                                aria-label={label}
                            >
                                <Icon className="w-6 h-6 text-white" />
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
