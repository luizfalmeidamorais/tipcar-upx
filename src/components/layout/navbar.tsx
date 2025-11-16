export default function NavBar() {
    return (
        <header className="sticky top-0 z-50 mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            <a className="font-semibold" href="/">
                TipCar
            </a>
            <nav className="hidden gap-3 text-sm sm:flex">
                <a className="opacity-80 hover:opacity-100" href="/app/dashboard">
                    Dashboard
                </a>
                <a className="opacity-80 hover:opacity-100" href="/app/rider/request">
                    Solicitar
                </a>
                <a className="opacity-80 hover:opacity-100" href="/app/driver/queue">
                    Motorista
                </a>
                <a className="opacity-80 hover:opacity-100" href="/app/profile">
                    Perfil
                </a>
            </nav>
            <div className="text-sm">
                {/* {session ? (
                    <form
                        action={async () => {
                            "use server";
                            await (await import("@/lib/auth")).auth.api.signOut({
                                headers: await headers(),
                            });
                        }}
                    >
                        <button className="opacity-80 hover:opacity-100">Sair</button>
                    </form>
                ) : (
                    <a className="opacity-80 hover:opacity-100" href="/auth/sign-in">
                        Entrar
                    </a>
                )} */}
            </div>
        </header>
    );
}
