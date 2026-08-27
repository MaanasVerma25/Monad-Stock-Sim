"use client"

import { Navbar } from "@/components/Navbar"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { ClaimFundsButton } from "@/components/onboarding/ClaimFundsButton"
import { StockCard } from "@/components/dashboard/StockCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Anchor, Activity, Zap } from "lucide-react"
import { STOCKS } from "@/lib/contracts/contracts"
import { useAccount } from "wagmi"

export default function DashboardPage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Live Hybrid Market Dashboard
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Real stock closing prices re-anchor every 24 hours. Intraday price discovery is driven by sensitive on-chain bonding curves on Monad.
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {STOCKS.map((stock) => (
            <StockCard
              key={stock.id}
              stockId={stock.id}
              ticker={stock.ticker}
              name={stock.name}
              defaultBasePrice={stock.defaultBasePrice}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Hybrid Bonding-Curve Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Anchor className="h-4 w-4 text-primary" />
                  24h Real Price Anchor
                </p>
                <p>Base price is updated daily from real market closing prices (AAPL, TSLA, NVDA, etc.).</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Sensitive Bonding Curve
                </p>
                <p>Every trade shifts the price dynamically relative to the daily anchor using constant product x*y=k math.</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Instant On-Chain Execution
                </p>
                <p>Trades execute in &lt;1s on Monad parallel EVM. Contract events drive instant chart updates.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}