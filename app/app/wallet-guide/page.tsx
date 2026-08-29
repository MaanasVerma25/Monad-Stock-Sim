"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { Wallet, Download, Globe, Key, Shield, ArrowRight } from "lucide-react"

export default function WalletGuidePage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Wallet Setup Guide
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Step-by-step instructions for connecting your Web3 wallet, switching to Monad Testnet, and managing your private keys securely.
      </p>

      {/* Step 1 */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono text-sm font-bold">1</div>
            <h2 className="text-xl font-bold text-white">Install a Web3 Wallet</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            PulseStock requires an EVM-compatible browser wallet. We recommend:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "MetaMask", desc: "Most widely supported EVM wallet extension" },
              { name: "Rabby Wallet", desc: "Multi-chain wallet with built-in security checks" },
              { name: "Coinbase Wallet", desc: "Simple setup with Coinbase account integration" },
            ].map((wallet) => (
              <div key={wallet.name} className="bg-black rounded-lg border border-white/10 p-4">
                <p className="text-white text-sm font-semibold mb-1">{wallet.name}</p>
                <p className="text-[#9a9a9a] text-xs">{wallet.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono text-sm font-bold">2</div>
            <h2 className="text-xl font-bold text-white">Add Monad Testnet Network</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            Open your wallet settings and add a custom network with these parameters:
          </p>
          <div className="bg-black rounded-lg border border-white/10 p-6 space-y-3">
            {[
              { label: "Network Name", value: "Monad Testnet" },
              { label: "RPC URL", value: "https://testnet-rpc.monad.xyz" },
              { label: "Chain ID", value: "10143" },
              { label: "Currency Symbol", value: "MON" },
              { label: "Block Explorer", value: "https://testnet.monadexplorer.com" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[#9a9a9a] text-xs font-mono">{item.label}</span>
                <span className="text-white text-xs font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono text-sm font-bold">3</div>
            <h2 className="text-xl font-bold text-white">Get Testnet MON Tokens</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            You need a small amount of MON to pay gas fees on Monad Testnet. Visit the official Monad faucet to receive free testnet tokens:
          </p>
          <div className="bg-black rounded-lg border border-white/10 p-4">
            <p className="text-white text-sm font-mono">https://faucet.monad.xyz</p>
            <p className="text-[#9a9a9a] text-xs mt-2">Enter your wallet address and receive MON within seconds.</p>
          </div>
        </div>
      </section>

      {/* Step 4 */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono text-sm font-bold">4</div>
            <h2 className="text-xl font-bold text-white">Connect to PulseStock & Claim MON</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            Click &quot;Connect Wallet&quot; in the top-right corner of PulseStock. Once connected, navigate to the Onboarding page and click &quot;Claim 100k MON&quot; to receive your starter trading funds.
          </p>
          <div className="flex items-center gap-2 text-white text-sm">
            <ArrowRight className="h-4 w-4" />
            <span>You&apos;re ready to trade stock equities on Monad!</span>
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section>
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-white" />
            <h2 className="text-xl font-bold text-white">Private Key Security</h2>
          </div>
          <ul className="space-y-3 text-[#9a9a9a] text-sm">
            <li className="flex items-start gap-2">
              <Key className="h-4 w-4 text-white mt-0.5 shrink-0" />
              <span>Never share your seed phrase or private key with anyone. PulseStock will never ask for it.</span>
            </li>
            <li className="flex items-start gap-2">
              <Key className="h-4 w-4 text-white mt-0.5 shrink-0" />
              <span>Use a dedicated testnet wallet. Do not use wallets that hold real mainnet assets.</span>
            </li>
            <li className="flex items-start gap-2">
              <Key className="h-4 w-4 text-white mt-0.5 shrink-0" />
              <span>Always verify you&apos;re on the correct Monad Testnet (Chain ID: 10143) before approving transactions.</span>
            </li>
          </ul>
        </div>
      </section>
    </ContentPageLayout>
  )
}
