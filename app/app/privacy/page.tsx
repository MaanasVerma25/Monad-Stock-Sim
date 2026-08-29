"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Privacy Policy
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Last updated: August 28, 2026
      </p>

      <div className="space-y-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            PulseStock (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a testnet-only synthetic equity trading simulation deployed on Monad Testnet. This Privacy Policy explains how we collect, use, and protect information when you interact with our platform. PulseStock does not process real financial transactions, hold custody of real assets, or collect personally identifiable information beyond what is described below.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
          <ul className="space-y-3 text-[#9a9a9a] text-sm">
            <li><strong className="text-white">Wallet Addresses:</strong> When you connect your Web3 wallet, your public Ethereum-compatible address is read by the frontend to display balances and execute transactions. We do not store wallet addresses on our servers.</li>
            <li><strong className="text-white">Transaction Metadata:</strong> All trades are executed on-chain via the Monad Testnet. Transaction hashes, block numbers, and event logs are publicly visible on the Monad block explorer. We do not maintain a separate off-chain database of transaction records.</li>
            <li><strong className="text-white">Analytics Data:</strong> We may collect anonymized usage analytics (page views, feature interactions) via privacy-respecting analytics tools. No cookies are used for cross-site tracking.</li>
            <li><strong className="text-white">API Requests:</strong> Price data requests to our /api/stock-history endpoint are logged with standard HTTP request metadata (IP address, user agent, timestamps) for operational monitoring. Logs are rotated and purged after 30 days.</li>
          </ul>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">3. On-Chain Data</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            All trading activity occurs on the Monad Testnet public blockchain. On-chain data — including wallet balances, trade executions, and token transfers — is immutable and publicly accessible. We do not control or moderate on-chain data once transactions are confirmed. Users should be aware that their wallet address and transaction history on Monad Testnet are publicly visible.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">4. Data Sharing</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            We do not sell, trade, or rent user data to third parties. We may share anonymized, aggregated usage statistics for research or reporting purposes. Price data is sourced from Marketstack API under their terms of service.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">5. Security</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            PulseStock operates entirely on testnet infrastructure. No real assets are at risk. We implement standard web security practices (HTTPS, CSP headers, input sanitization) for the frontend application. Smart contracts have not been formally audited and are provided as-is for demonstration purposes.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">6. Contact</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            For privacy-related inquiries, contact us at <span className="text-white font-mono">team@pulsestock.dev</span>.
          </p>
        </div>
      </div>
    </ContentPageLayout>
  )
}
