"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { Zap, LayoutDashboard, Wallet, Trophy } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Home", icon: Zap },
    { href: "/dashboard", label: "Markets & Trade", icon: LayoutDashboard },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 bg-primary rounded-lg text-primary-foreground group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Monad Market Sim
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-xl border">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-background text-primary shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
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
      <div className="flex md:hidden border-t px-2 py-1.5 justify-around bg-muted/30">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-all ${
                isActive ? "text-primary font-bold" : "text-muted-foreground"
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
