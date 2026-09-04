"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PulseStockLogo } from "@/components/PulseStockLogo"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { Zap, LayoutDashboard, Wallet, Trophy } from "lucide-react"
import { TopTickerMarquee } from "@/components/TopTickerMarquee"

export function Navbar() {
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Home", icon: Zap },
    { href: "/dashboard", label: "Markets & Trade", icon: LayoutDashboard },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
      <TopTickerMarquee />
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">

        <PulseStockLogo />

        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? "border border-white/10 bg-zinc-800 text-white font-semibold"
                    : "text-[#9a9a9a] hover:text-white hover:border hover:border-white/10 hover:bg-white/5"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#9a9a9a]"}`} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ConnectButton />
        </div>
      </div>

      {/* Mobile nav bar row */}
      <div className="flex md:hidden border-t border-white/10 px-2 py-1.5 justify-around bg-black/80 backdrop-blur-md">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-all ${
                isActive ? "text-white font-bold" : "text-[#9a9a9a]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </div>
    </header>
  )
}
