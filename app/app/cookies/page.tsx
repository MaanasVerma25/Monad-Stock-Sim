"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { Cookie } from "lucide-react"

export default function CookiesPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Cookie & Storage Policy
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Last updated: August 28, 2026
      </p>

      <div className="space-y-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            PulseStock takes a minimal approach to client-side storage. We do not use cookies for advertising, cross-site tracking, or user profiling. This policy describes the limited storage mechanisms used to operate the Platform.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">2. Local Storage</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            PulseStock uses browser localStorage for the following purposes:
          </p>
          <div className="space-y-3">
            <div className="bg-black rounded-lg border border-white/10 p-4">
              <p className="text-white text-sm font-mono mb-1">wagmi.store</p>
              <p className="text-[#9a9a9a] text-xs">Stores wallet connection state (connected wallet type, last connected address) to persist your session across page reloads. No private keys are stored.</p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-4">
              <p className="text-white text-sm font-mono mb-1">theme-preference</p>
              <p className="text-[#9a9a9a] text-xs">Stores UI theme preference (dark mode). PulseStock defaults to dark mode and does not currently offer a light theme toggle.</p>
            </div>
          </div>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">3. Session Storage</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            Session storage may be used for temporary UI state (e.g., expanded accordion panels, selected stock tabs). This data is cleared when you close the browser tab and is never transmitted to any server.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Cookies</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            PulseStock does not embed third-party advertising scripts, social media trackers, or cross-site analytics that set cookies. If you connect via a wallet browser extension (e.g., MetaMask), that extension may use its own storage mechanisms governed by its own privacy policy.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">5. Managing Storage</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            You can clear all PulseStock-related storage by using your browser&apos;s &quot;Clear Site Data&quot; function in Developer Tools. This will disconnect your wallet session and reset any UI preferences. Your on-chain data (balances, trade history) is unaffected as it lives on the Monad Testnet blockchain.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">6. Contact</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            For questions about our cookie and storage practices, contact us at <span className="text-white font-mono">team@pulsestock.dev</span>.
          </p>
        </div>
      </div>
    </ContentPageLayout>
  )
}
