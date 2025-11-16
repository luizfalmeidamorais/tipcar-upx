"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { initMercadoPago } from "@mercadopago/sdk-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);
      new (window as any).MercadoPago(
        process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, // <- AQUI usa a public key
        { locale: "pt-BR" }
      );
    })();
  }, []);

  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider />
      {children}
    </HeroUIProvider>
  );
}
