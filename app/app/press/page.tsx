"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { Newspaper, Download, Palette } from "lucide-react"

export default function PressPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Press & Media
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Press kit, brand assets, and official platform announcements for media coverage and editorial use.
      </p>

      {/* Brand Assets */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Brand Assets</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-6">
            Official PulseStock brand colors, typography, and logo specifications for editorial and media use.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { color: "#000000", name: "Canvas Black" },
              { color: "#FFFFFF", name: "Primary White" },
              { color: "#9a9a9a", name: "Metallic Gray" },
              { color: "#22C55E", name: "Signal Green" },
            ].map((c) => (
              <div key={c.name} className="bg-black rounded-lg border border-white/10 p-4 text-center">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 border border-white/20" style={{ backgroundColor: c.color }} />
                <p className="text-white text-xs font-mono">{c.color}</p>
                <p className="text-[#9a9a9a] text-xs">{c.name}</p>
              </div>
            ))}
          </div>
          <div className="bg-black rounded-lg border border-white/10 p-4">
            <p className="text-[#9a9a9a] text-xs mb-1"><strong className="text-white">Primary Font:</strong> Inter (Sans-serif)</p>
            <p className="text-[#9a9a9a] text-xs mb-1"><strong className="text-white">Accent Font:</strong> Instrument Serif (Italic)</p>
            <p className="text-[#9a9a9a] text-xs"><strong className="text-white">Mono Font:</strong> JetBrains Mono</p>
          </div>
        </div>
      </section>

      {/* Press Kit */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Download className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Press Kit</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            Download the PulseStock press kit containing high-resolution logos, screenshots, and one-pager descriptions for editorial and conference use.
          </p>
          <div className="bg-black rounded-lg border border-white/10 p-4">
            <p className="text-[#9a9a9a] text-xs font-mono">Press kit available upon request: team@pulsestock.dev</p>
          </div>
        </div>
      </section>

      {/* Announcement Log */}
      <section>
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Announcements</h2>
          </div>
          <div className="space-y-4">
            {[
              { date: "Aug 2026", title: "PulseStock Synthetic Equity Protocol Deployed on Monad Testnet", desc: "Initial release of the synthetic equity trading terminal with 8 real-world tickers, bonding curve AMM, and sub-second Monad execution." },
              { date: "Aug 2026", title: "Vesper UI Redesign — Liquid Glass Aesthetic", desc: "Complete frontend overhaul to pitch-black canvas, translucent glass cards, and Instrument Serif editorial typography." },
              { date: "Aug 2026", title: "Open-Source Codebase Published", desc: "Full smart contract and frontend source code released on GitHub under MIT license for community review and forking." },
            ].map((item, i) => (
              <div key={i} className="bg-black rounded-lg border border-white/10 p-5">
                <p className="text-white font-mono text-xs mb-1 opacity-50">{item.date}</p>
                <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-[#9a9a9a] text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ContentPageLayout>
  )
}
