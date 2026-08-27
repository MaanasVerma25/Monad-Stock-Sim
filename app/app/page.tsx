"use client"

import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { ClaimFundsButton } from "@/components/onboarding/ClaimFundsButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Wallet, Zap, TrendingUp, Anchor, ShieldCheck, Activity } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/50">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <section className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20">
            <Zap className="h-3.5 w-3.5" /> Powered by Monad Parallel EVM & Real Equity Oracles
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Trade Real Stocks with <br className="hidden sm:inline" />
            <span className="text-primary bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
              On-Chain Bonding Curves
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience real-world equity markets (AAPL, TSLA, NVDA, GOOGL, MSFT) anchored to daily closing prices with high-sensitivity intraday bonding curves on Monad.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/onboarding">
              <Button size="lg" className="gap-2 font-bold px-6 shadow-lg hover:shadow-primary/25 transition-all">
                <Wallet className="h-5 w-5" />
                Claim 100k SUSD & Start
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 px-6">
                <TrendingUp className="h-5 w-5 text-primary" />
                Live Dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          <Card className="hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader>
              <Anchor className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">24h Real Price Anchors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Base prices re-anchor daily to real NYSE/NASDAQ closing prices (AAPL, TSLA, NVDA, etc.), preventing runaway market drift.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader>
              <Activity className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">Sensitive Bonding Curves</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Intraday trades shift spot prices dynamically using constant-product math (`x * y = k`). Every trade impacts live market depth.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors shadow-sm">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">Sub-Second Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Monad&apos;s high-throughput parallel EVM confirms trades in &lt;1 second. Web3 contract events update charts instantly without WebSockets.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="text-center max-w-xl mx-auto p-8 rounded-2xl bg-card border shadow-sm">
          <h3 className="text-2xl font-bold mb-3">Ready to test your trading strategy?</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Get 100,000 SimUSD (SUSD) play money minted directly to your wallet with one click.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="w-full gap-2 font-bold">
              <Zap className="h-5 w-5" />
              Get Started Now
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t py-8 mt-16 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for Monad Blitz Hackathon • Real Equity Anchors • On-Chain State</p>
        </div>
      </footer>
    </div>
  )
}