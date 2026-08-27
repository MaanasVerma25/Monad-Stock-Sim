"use client"

import { Navbar } from "@/components/Navbar"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { ClaimFundsButton } from "@/components/onboarding/ClaimFundsButton"
import { StockCard } from "@/components/dashboard/StockCard"
import { Card, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { STOCKS } from "@/lib/contracts/contracts"
import { useAccount } from "wagmi"

export default function TradePage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            Markets & Live Trade
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Click on any stock card below to open the buy/sell trading panel. All prices are anchored to real market closes with instant bonding curve execution.
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
      </main>
    </div>
  )
}