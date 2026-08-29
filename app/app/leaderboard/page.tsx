"use client"

import { Navbar } from "@/components/Navbar"
import { Leaderboard } from "@/components/leaderboard/Leaderboard"
import { Trophy } from "lucide-react"

export default function LeaderboardPage() {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Full-Bleed Gold World Map Background */}
      <div 
        className="fixed inset-0 w-full h-full z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/gold-world-map.jpg')" }}
      >
        {/* Translucent Dark Scrim & Glass Overlay */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
      </div>

      {/* Main Leaderboard Content Layer */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.8)] filter brightness-125" />
              Global Trader Rankings
            </h1>
            <p className="text-zinc-300 text-base font-medium">
              Live ranking of top traders by net portfolio valuation. Aggregated from real-time smart contract events.
            </p>
          </div>

          <Leaderboard />
        </main>
      </div>
    </div>
  )
}