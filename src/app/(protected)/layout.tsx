import BottomNav from "@/components/BottomNavServer";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AuthLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession()
    if (!session) {
        redirect("/auth/entrar")
    }

    return (
        <div className="mx-auto min-h-dvh w-full max-w-md bg-white">
            <div className="pt-[env(safe-area-inset-top)]" />
            <main className="min-h-[calc(100dvh-96px)] pb-24">{children}</main>
            <BottomNav />
        </div>
    );
}
