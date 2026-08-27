"use client"

import { ConnectButton } from "@/components/wallet/ConnectButton"
import { ClaimFundsButton } from "@/components/onboarding/ClaimFundsButton"
import { StockCard } from "@/components/dashboard/StockCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, TrendingUp, ExternalLink } from "lucide-react"
import { STOCKS } from "@/lib/contracts/contracts"
import { useAccount } from "wagmi"

export default function DashboardPage() {
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
            <Link href="/trade" className="text-sm font-medium hover:text-primary">
              Trade
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time bonding curve prices for 5 synthetic stocks. Charts update instantly on every trade.
          </p>
        </div>

        {!isConnected && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Connect your wallet to view live prices and claim starter funds</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {STOCKS.map((stock) => (
            <StockCard key={stock.id} stockId={stock.id} ticker={stock.ticker} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Constant Product Bonding Curve</p>
                <p>Each stock uses x*y=k pricing. Buying moves price up, selling moves price down.</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">Live Event-Driven Updates</p>
                <p>Charts subscribe to Trade events via wagmi's useWatchContractEvent. Sub-second updates on Monad.</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium mb-2">5 Independent Markets</p>
                <p>MNDX, CHAI, VIBE, GRIT, TECH — each with separate reserves and price discovery.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}