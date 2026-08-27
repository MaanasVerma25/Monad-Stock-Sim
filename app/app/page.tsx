"use client"

import Link from "next/link"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { ClaimFundsButton } from "@/components/onboarding/ClaimFundsButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Wallet, Zap, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Monad Market Sim</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/trade" className="text-sm font-medium hover:text-primary transition-colors">
              Trade
            </Link>
            <Link href="/portfolio" className="text-sm font-medium hover:text-primary transition-colors">
              Portfolio
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
              Leaderboard
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Stock Market Simulator on <span className="text-primary">Monad</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Trade synthetic stocks with bonding curve pricing. Experience sub-second finality
            and live price updates powered by Monad's high-throughput EVM.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/onboarding">
              <Button size="lg" className="gap-2">
                <Wallet className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <TrendingUp className="h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Sub-Second Finality</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monad's parallel execution delivers &lt;1s block times. See your trades confirm
                and charts update in real-time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Live Bonding Curves</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                5 synthetic stocks (MNDX, CHAI, VIBE, GRIT, TECH) each with independent
                x*y=k bonding curves. Price moves with every trade.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Real-Time Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                WebSocket-free live updates via contract events. Recharts updates instantly
                on every Trade event emission.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center">
          <Link href="/onboarding">
            <Button size="lg" className="w-full max-w-md mx-auto gap-2">
              <Zap className="h-5 w-5" />
              Claim 100,000 SUSD & Start Trading
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for Monad Blitz Hackathon • All state on-chain • No backend</p>
        </div>
      </footer>
    </div>
  )
}