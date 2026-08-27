"use client"

import { ConnectButton } from "@/components/wallet/ConnectButton"
import { ClaimFundsButton } from "@/components/onboarding/ClaimFundsButton"
import { TradePanel } from "@/components/trade/TradePanel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { STOCKS } from "@/lib/contracts/contracts"
import { useAccount } from "wagmi"

export default function TradePage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Monad Market Sim</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </Link>
            <Link href="/portfolio" className="text-sm font-medium hover:text-primary">
              Portfolio
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-primary">
              Leaderboard
            </Link>
            <ConnectButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trade Stocks</h1>
          <p className="text-muted-foreground">
            Buy and sell synthetic stocks using bonding curve pricing. Prices update live on every trade.
          </p>
        </div>

        {!isConnected && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Connect your wallet to trade</p>
                  <p className="text-sm text-muted-foreground">MetaMask required • Monad testnet (Chain ID: 10143)</p>
                </div>
                <div className="flex gap-2">
                  <ConnectButton />
                  <ClaimFundsButton />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {STOCKS.map((stock) => (
            <TradePanel key={stock.id} stockId={stock.id} ticker={stock.ticker} />
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              <ArrowDownRight className="h-5 w-5" />
              Trading Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium mb-2">Buying (SUSD → Shares)</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Price increases with each buy (bonding curve)</li>
                  <li>Shares received = (shareReserve × cashIn) / (cashReserve + cashIn)</li>
                  <li>SUSD transferred from your wallet to contract</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2">Selling (Shares → SUSD)</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Price decreases with each sell</li>
                  <li>SUSD received = (cashReserve × sharesIn) / (shareReserve + sharesIn)</li>
                  <li>SUSD transferred from contract to your wallet</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}