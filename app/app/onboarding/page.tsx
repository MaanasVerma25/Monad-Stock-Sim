"use client"

import { useAccount } from "wagmi"
import { Navbar } from "@/components/Navbar"
import { ConnectButton } from "@/components/wallet/ConnectButton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Wallet, Zap, CheckCircle2, ArrowRight, ExternalLink, Fuel } from "lucide-react"

export default function OnboardingPage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />

      {/* Main Container */}
      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <div className="p-4 bg-zinc-950/60 w-fit rounded-2xl border border-white/10 mx-auto mb-6">
            <Zap className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-serif text-4xl font-bold tracking-tight text-white mb-3">
            Onboarding & Native MON Setup
          </h1>
          <p className="text-[#9a9a9a] text-base max-w-xl mx-auto font-medium">
            Use native MON directly from your MetaMask wallet to trade synthetic equities (AAPL, TSLA, NVDA, GOOGL, MSFT) on Monad Testnet.
          </p>
        </div>

        {/* Step 1 Card */}
        <Card className="mb-6 bg-black/80 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-md">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-serif text-xl font-bold text-white flex items-center gap-3">
              <Wallet className="h-5 w-5 text-white" />
              Step 1: Connect MetaMask Wallet
            </CardTitle>
            <CardDescription className="text-[#9a9a9a]">
              Link your browser wallet to Monad Testnet (Chain ID: 10143)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <ConnectButton />
            {isConnected && (
              <div className="flex items-center gap-2 text-[#22C55E] font-mono text-xs bg-black p-3 rounded-lg border border-emerald-500/30 w-fit">
                <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                <span>Connected to Monad Testnet</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2 Card */}
        <Card className="mb-6 bg-black/80 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-md">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-serif text-xl font-bold text-white flex items-center gap-3">
              <Fuel className="h-5 w-5 text-[#22C55E]" />
              Step 2: Get Native MON from Monad Faucet
            </CardTitle>
            <CardDescription className="text-[#9a9a9a]">
              Native MON balance is used for both trading collateral and transaction gas fees.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <a
              href="https://faucet.monad.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-full justify-center bg-gradient-to-r from-emerald-600 to-emerald-500 hover:opacity-90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md font-mono text-sm"
            >
              Get Free Testnet MON at Monad Faucet <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-xs text-[#9a9a9a] leading-relaxed">
              Monad charges gas on <strong className="text-white font-mono">gas_limit (150,000)</strong>, not gas used. Make sure your wallet holds native MON.
            </p>
          </CardContent>
        </Card>

        {/* Step 3 Card */}
        <Card className="mb-10 bg-black/80 backdrop-blur-sm border border-white/10 p-8 rounded-xl shadow-md">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="font-serif text-xl font-bold text-white flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-white" />
              Step 3: Start Trading Real Stocks
            </CardTitle>
            <CardDescription className="text-[#9a9a9a]">
              Head to the dashboard to view live prices anchored to 24h real market closes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Link href="/dashboard">
              <Button className="w-full bg-gradient-to-b from-white via-zinc-200 to-zinc-400 text-black border border-white py-3 text-base font-semibold hover:opacity-90 transition-opacity">
                Open Live Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Network Details Summary */}
        <div className="bg-black p-6 rounded-xl border border-white/10 text-xs font-mono text-[#9a9a9a]">
          <p className="font-serif text-sm font-bold text-white mb-3">Monad Network Parameters:</p>
          <ul className="space-y-1.5">
            <li><span className="text-white font-semibold">Network Name:</span> Monad Testnet</li>
            <li><span className="text-white font-semibold">Chain ID:</span> 10143</li>
            <li><span className="text-white font-semibold">RPC URL:</span> https://testnet-rpc.monad.xyz</li>
            <li><span className="text-white font-semibold">Native Asset:</span> MON (Used for Trading & Gas)</li>
            <li><span className="text-white font-semibold">Gas Policy:</span> Charges on explicit gas_limit</li>
          </ul>
        </div>
      </main>
    </div>
  )
}