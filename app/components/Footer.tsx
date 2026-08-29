"use client"

import Link from "next/link"
import { PulseStockLogo } from "@/components/PulseStockLogo"

export function Footer() {
  const platformLinks = [
    { href: "/docs", label: "Documentation" },
    { href: "/faqs", label: "FAQs" },
    { href: "/wallet-guide", label: "Wallet Guide" },
  ]

  const companyLinks = [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/press", label: "Press" },
    { href: "/blog", label: "Blog" },
  ]

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/affiliate", label: "Affiliate Program" },
  ]

  return (
    <footer className="bg-zinc-950/95 border-t border-white/10 z-10 relative py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <PulseStockLogo />
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Synthetic equity trading anchored to real-world closing prices, powered by Monad&apos;s parallel EVM.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-zinc-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-400 text-xs font-mono">
            © 2026 Pulse Stock. All rights reserved.
          </p>
          <p className="text-zinc-400 text-xs font-mono">
            Real Equity Anchors • Institutional Terminal Architecture
          </p>
        </div>
      </div>
    </footer>
  )
}
