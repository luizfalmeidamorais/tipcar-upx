import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { SerwistProvider } from "@/lib/client";

const APP_NAME = "TIPCAR"
const APP_DESCRIPTION = "Aplicativo de carona"

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME
  },
  formatDetection: {
    telephone: false,
  },
  // icons: {
  //   shortcut: "/favicon.ico",
  //   apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  // },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SerwistProvider swUrl="/serwist/sw.js" options={{ type: "module" }}>
          <Providers>{children}</Providers>
        </SerwistProvider>

      </body>
    </html>
  );
}
