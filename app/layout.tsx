import type { Metadata, Viewport } from "next";
import "./globals.css";
import Link from "next/link";
import { PWARegister } from "../components/pwa-register";

export const metadata: Metadata = {
  title: "ARHA-FoodLens | AI Personal Food Health Companion",
  description: "Scan Indian packaged foods, expose harmful additives and globally banned chemicals, track nutrition, and receive personalized health risk warnings calibrated for you and your family.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ARHA-FoodLens"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#060913"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
        <PWARegister />
        {/* Main Desktop Header */}
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-black font-extrabold text-xl shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-200">
              ⎔
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ARHA
              </span>
              <span className="font-display font-semibold text-emerald-400 text-xs ml-1 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                FOODLENS
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <Link href="/scan" className="hover:text-emerald-400 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3.5 py-1.5 rounded-lg border border-emerald-500/20 transition-all">Quick Scan</Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Dashboard</Link>
            <Link href="/diary" className="hover:text-emerald-400 transition-colors">Diary</Link>
            <Link href="/pantry" className="hover:text-emerald-400 transition-colors">Pantry Audit</Link>
            <Link href="/compare" className="hover:text-emerald-400 transition-colors">Compare</Link>
            <Link href="/browse" className="hover:text-emerald-400 transition-colors">Encyclopedia</Link>
            <Link href="/family" className="hover:text-emerald-400 transition-colors">Family</Link>
            <Link href="/alerts" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              Alerts
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/profile/edit" className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-sm hover:border-emerald-500 hover:text-emerald-400 transition-all">
              A
            </Link>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Desktop Footer */}
        <footer className="hidden lg:block border-t border-white/5 bg-slate-950/40 py-8 px-4 text-center text-xs text-slate-500">
          <p>© 2026 ARHA-FoodLens. India's First Personalized AI Food Health Companion. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/settings" className="hover:underline">Settings</Link>
            <span>•</span>
            <a href="#" className="hover:underline">Medical Disclaimer</a>
            <span>•</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </footer>

        {/* Mobile Sticky Bottom Navigation (PWA feel) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-t border-white/5 px-2 py-2 flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors">
            <span className="text-lg">🏠</span>
            <span>Home</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors">
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/scan" className="flex flex-col items-center justify-center -mt-6 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 text-black shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform duration-150">
            <span className="text-2xl">📷</span>
          </Link>
          <Link href="/diary" className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors">
            <span className="text-lg">📔</span>
            <span>Diary</span>
          </Link>
          <Link href="/pantry" className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-emerald-400 transition-colors">
            <span className="text-lg">🧺</span>
            <span>Pantry</span>
          </Link>
        </div>
      </body>
    </html>
  );
}
