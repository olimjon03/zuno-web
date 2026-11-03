import { LanguageProvider } from "@/features/language/provider";
import { Suspense } from "react";
import { AuthRouteSync } from "@/components/layout/auth-route-sync";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UnreadProvider } from "@/features/messages/unread-provider";
import { LocationProvider } from "@/features/locations/location-provider";
import { FavoritesProvider } from "@/features/favorites/favorites-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZUNO | Buy · Sell · Connect Locally",
  description:
    "Discover second-hand finds in your Seoul neighborhood. Buy, sell, and connect locally with ZUNO. Sample marketplace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider><LocationProvider><FavoritesProvider>
          <UnreadProvider>{children}<Suspense fallback={null}><AuthRouteSync/><MobileNav/></Suspense></UnreadProvider>
        </FavoritesProvider></LocationProvider></LanguageProvider>
      </body>
    </html>
  );
}
