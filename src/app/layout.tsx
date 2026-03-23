import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalNav from "@/components/GlobalNav";
import MobileBottomNav from "@/components/MobileBottomNav";
import NotificationBanner from "@/components/NotificationBanner";
import AppShell from "@/components/AppShell";
import { AssetProvider } from "@/context/AssetContext";
import { TourProvider } from "@/context/TourContext";
import DemoTour from "@/components/DemoTour";
import { Providers } from "@/components/ProvidersWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YAS Assurance — Fleet Command Center",
  description: "Real-time robotics and autonomous fleet assurance platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "YAS",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="YAS Fleet Intelligence" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="YAS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#020203" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} bg-yas-base text-yas-text antialiased`} style={{ overscrollBehavior: 'none' }}>
        <Providers>
          <AssetProvider>
            <TourProvider>
              <GlobalNav />
              <NotificationBanner />
              <DemoTour />
              <AppShell>
                {children}
              </AppShell>
              <MobileBottomNav />
            </TourProvider>
          </AssetProvider>
        </Providers>
      </body>
    </html>
  );
}
