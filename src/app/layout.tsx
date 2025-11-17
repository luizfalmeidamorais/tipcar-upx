import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { SerwistProvider } from "@/lib/client";
import "maplibre-gl/dist/maplibre-gl.css";

const APP_NAME = "TIPCAR";
const APP_DESCRIPTION = "Aplicativo de carona";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
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
        <link href="/manifest.json" rel="manifest" />
      </head>

      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SerwistProvider options={{ type: "module" }} swUrl="/serwist/sw.js">
          <Providers>{children}</Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
