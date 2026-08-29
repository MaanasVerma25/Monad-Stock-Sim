"use client"

import { Navbar } from "@/components/Navbar"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { ClaimFundsButton } from "@/components/onboarding/ClaimFundsButton"
import { StockCard } from "@/components/dashboard/StockCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Anchor, Activity, Zap, MousePointerClick } from "lucide-react"
import { STOCKS } from "@/lib/contracts/contracts"
import { useAccount } from "wagmi"

export default function DashboardPage() {
  const { isConnected } = useAccount()

  return (
    <div className="relative min-h-screen bg-transparent text-white overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full z-0 object-cover pointer-events-none"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-black/40 z-[1] pointer-events-none" />

      <div className="relative z-10 bg-transparent min-h-screen">
        <Navbar />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
            <Activity className="h-8 w-8 text-white" />
            Live Market Dashboard & Equities
          </h1>
          <p className="text-[#9a9a9a] text-base max-w-3xl flex items-center gap-2 font-medium">
            <MousePointerClick className="h-4 w-4 text-white shrink-0" />
            Click any stock card below to open its instant Trade modal. Real 24h market price anchors ($AAPL, $TSLA, $NVDA, etc.) paired with sensitive bonding curves on Monad.
          </p>
        </div>

        {!isConnected && (
          <Card className="mb-10 bg-black/80 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-md">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white mb-1">Connect Your Wallet to Access Trading</h3>
                  <p className="text-sm text-[#9a9a9a]">MetaMask required • Monad Testnet (Chain ID: 10143)</p>
                </div>
                <div className="flex items-center gap-3">
                  <ConnectButton />
                  <ClaimFundsButton />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {STOCKS.map((stock) => (
            <StockCard
              key={stock.id}
              stockId={stock.id}
              ticker={stock.ticker}
              name={stock.name}
            />
          ))}
        </div>

        {/* Architecture Info Footer Box */}
        <Card className="bg-black/80 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-md">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="font-serif text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="h-6 w-6 text-white" />
              Hybrid Bonding-Curve Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3 gap-6 text-sm text-[#9a9a9a]">
              <div className="p-6 bg-zinc-950/60 rounded-lg border border-white/10">
                <h4 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-white" />
                  24h Real Price Anchor
                </h4>
                <p className="leading-relaxed">Base prices are updated daily from real market closing prices (AAPL, TSLA, NVDA, GOOGL, MSFT, etc.).</p>
              </div>
              <div className="p-6 bg-zinc-950/60 rounded-lg border border-white/10">
                <h4 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#22C55E]" />
                  Sensitive Bonding Curve
                </h4>
                <p className="leading-relaxed">Every trade shifts the spot price dynamically relative to the daily anchor using constant product $x \cdot y = k$ math.</p>
              </div>
              <div className="p-6 bg-zinc-950/60 rounded-lg border border-white/10">
                <h4 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-white" />
                  Instant On-Chain Execution
                </h4>
                <p className="leading-relaxed">Trades execute in sub-second blocks on Monad parallel EVM. Contract log events drive instant chart updates.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      </div>
    </div>
  )
}