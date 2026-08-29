"use client"

import Link from "next/link"
import { Instrument_Serif } from "next/font/google"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Zap, TrendingUp, Anchor, Activity, ArrowRight, ShieldCheck } from "lucide-react"

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: "italic",
  subsets: ["latin"],
})

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F8FAFC] relative overflow-hidden">
      {/* Full-screen Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-100 pointer-events-none"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Scrim Overlay for Text Legibility */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90 pointer-events-none z-0" />

      {/* Content Layer */}
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-20">
          <section className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="font-sans text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-[#FFFFFF] leading-tight drop-shadow-md antialiased">
              Trade Real Stocks with <br className="hidden sm:inline" />
              On-Chain <em className={`${instrumentSerif.className} not-italic text-[#9a9a9a] text-[1.08em] font-normal`}>Bonding Curves</em>
            </h1>

            <p className="text-lg md:text-xl text-[#9a9a9a] mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-sm font-medium">
              Experience real-world equity markets (AAPL, TSLA, NVDA, GOOGL, MSFT) anchored to daily closing prices with high-sensitivity intraday bonding curves on Monad.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="w-full sm:w-auto gap-2 bg-gradient-to-b from-white via-zinc-200 to-zinc-400 text-black font-medium border border-white shadow-lg shadow-white/10 hover:opacity-90 transition-opacity px-8 py-4 text-base"
                >
                  <TrendingUp className="h-5 w-5 text-black" />
                  Open Live Dashboard
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gap-2 backdrop-blur-md bg-white/10 border border-white/30 text-white hover:bg-white/20 transition-all px-8 py-4 text-base font-medium"
                >
                  <Wallet className="h-5 w-5 text-white" />
                  Wallet Guide & Faucet
                </Button>
              </Link>
            </div>

            {/* Footer Stats Bar */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-14 pt-8 border-t border-white/10 text-[#d8d8d8] text-xs font-mono">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-white" />
                <span>10,000 TPS Throughput</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-white" />
                <span>400ms Block Time &bull; 800ms Finality</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white" />
                <span>100% Parallel EVM Execution</span>
              </div>
            </div>
          </section>

          {/* Feature Cards Grid */}
          <section className="grid md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
            <Card className="bg-black/60 backdrop-blur-md border border-white/10 p-8 rounded-xl shadow-none hover:border-white/30 transition-colors">
              <CardHeader className="p-0 mb-4">
                <div className="p-3 bg-white/5 w-fit rounded-lg border border-white/10 mb-3">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="font-serif text-2xl text-[#F8FAFC]">24h Real Price Anchors</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[#9a9a9a] text-sm leading-relaxed">
                  Base prices re-anchor daily to real market closing prices (AAPL, TSLA, NVDA, etc.), preventing runaway market drift.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-md border border-white/10 p-8 rounded-xl shadow-none hover:border-white/30 transition-colors">
              <CardHeader className="p-0 mb-4">
                <div className="p-3 bg-white/5 w-fit rounded-lg border border-white/10 mb-3">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="font-serif text-2xl text-[#F8FAFC]">Sensitive Bonding Curves</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[#9a9a9a] text-sm leading-relaxed">
                  Intraday trades shift spot prices dynamically using constant-product math ($x \cdot y = k$). Every order impacts live market depth.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/60 backdrop-blur-md border border-white/10 p-8 rounded-xl shadow-none hover:border-white/30 transition-colors">
              <CardHeader className="p-0 mb-4">
                <div className="p-3 bg-white/5 w-fit rounded-lg border border-white/10 mb-3">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="font-serif text-2xl text-[#F8FAFC]">Sub-Second Monad Execution</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-[#9a9a9a] text-sm leading-relaxed">
                  Monad&apos;s parallel EVM confirms trades in 800ms with 400ms block times. Web3 contract events drive instant chart updates.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* CTA Banner */}
          <section className="bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#F8FAFC] mb-4">
              Ready to test your trading strategy?
            </h2>
            <p className="text-[#9a9a9a] mb-8 max-w-xl mx-auto">
              Trade synthetic equities on Monad Testnet directly with native MON from your browser wallet.
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-b from-white via-zinc-200 to-zinc-400 text-black font-medium border border-white shadow-lg shadow-white/10 hover:opacity-90 transition-opacity px-8 py-4 text-base"
              >
                Start Trading Now <ArrowRight className="h-5 w-5 text-black" />
              </Button>
            </Link>
          </section>
        </main>
      </div>
    </div>
  )
}