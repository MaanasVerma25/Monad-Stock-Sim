"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { StockCard } from "@/components/dashboard/StockCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { STOCKS } from "@/lib/contracts/contracts"
import { useAccount } from "wagmi"

function TradeContent() {
  const { isConnected } = useAccount()
  const searchParams = useSearchParams()
  const activeTradeTicker = searchParams.get("trade")?.toUpperCase() || searchParams.get("stock")?.toUpperCase()

  return (
    <main className="container mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-white mb-3 flex items-center gap-3">
          <Activity className="h-8 w-8 text-white" />
          Markets & Live Trade
        </h1>
        <p className="text-[#9a9a9a] text-base max-w-3xl font-medium">
          Click on any stock card below to open its buy/sell trading panel and dual-line graph comparison. All prices are anchored to real market closes with instant bonding curve execution.
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
            autoOpen={activeTradeTicker === stock.ticker}
          />
        ))}
      </div>

      {/* Execution Rules Card */}
      <Card className="bg-black/80 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-md">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="font-serif text-2xl font-bold text-white flex items-center gap-3">
            <ArrowUpRight className="h-6 w-6 text-[#22C55E]" />
            <ArrowDownRight className="h-6 w-6 text-[#EF4444]" />
            Execution Mechanics Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-8 text-sm text-[#9a9a9a]">
            <div className="bg-zinc-950/60 p-6 rounded-lg border border-white/10">
              <h4 className="font-serif text-lg font-bold text-white mb-3">Buy Orders (MON → Shares)</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Spot price moves up deterministically with order size</li>
                <li>Shares Out: <code className="font-mono text-xs text-white bg-black px-1.5 py-0.5 rounded border border-white/10">(shareReserve × cashIn) / (cashReserve + cashIn)</code></li>
                <li>MON transferred directly from wallet to AMM contract</li>
              </ul>
            </div>
            <div className="bg-zinc-950/60 p-6 rounded-lg border border-white/10">
              <h4 className="font-serif text-lg font-bold text-white mb-3">Sell Orders (Shares → MON)</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Spot price moves down with share redemptions</li>
                <li>Cash Out: <code className="font-mono text-xs text-white bg-black px-1.5 py-0.5 rounded border border-white/10">(cashReserve × sharesIn) / (shareReserve + sharesIn)</code></li>
                <li>MON transferred directly from AMM contract back to wallet</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default function TradePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />
      <Suspense fallback={<div className="container mx-auto px-6 py-12 text-white font-mono">Loading trading page...</div>}>
        <TradeContent />
      </Suspense>
    </div>
  )
}