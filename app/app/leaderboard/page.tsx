"use client"

import { Navbar } from "@/components/Navbar"
import { Leaderboard } from "@/components/leaderboard/Leaderboard"
import { Trophy } from "lucide-react"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top traders by portfolio value. Computed from on-chain Trade events.
          </p>
        </div>

        <Leaderboard />
      </main>
    </div>
  )
}