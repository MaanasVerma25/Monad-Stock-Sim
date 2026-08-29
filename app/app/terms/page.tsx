"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"

export default function TermsPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Terms of Service
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Last updated: August 28, 2026
      </p>

      <div className="space-y-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            By accessing or using PulseStock (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. PulseStock is a testnet-only synthetic equity trading simulation. The Platform does not facilitate real securities trading, hold custody of real assets, or provide financial advice. If you do not agree to these terms, do not use the Platform.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">2. Nature of the Service</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            PulseStock operates on Monad Testnet using testnet tokens (MON) that have no real-world monetary value. All &quot;trades&quot; are simulated interactions with bonding curve smart contracts. The stocks (AAPL, TSLA, NVDA, etc.) are not actual securities and do not represent ownership in any real company. Price movements are driven by bonding curve mechanics and may not reflect actual market conditions.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">3. No Financial Advice</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            Nothing on PulseStock constitutes financial advice, investment recommendation, or solicitation to buy or sell real securities. The Platform is an educational and experimental tool for exploring DeFi bonding curve mechanics. Any resemblance to real trading platforms is for demonstration purposes only.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">4. User Responsibilities</h2>
          <ul className="space-y-2 text-[#9a9a9a] text-sm">
            <li>• You are responsible for securing your wallet private keys and seed phrases.</li>
            <li>• You understand that all transactions on Monad Testnet are irreversible once confirmed.</li>
            <li>• You will not use the Platform for any unlawful purpose or to circumvent securities regulations.</li>
            <li>• You acknowledge that the smart contracts have not been formally audited.</li>
          </ul>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">5. Non-Custodial Software</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            PulseStock is non-custodial software. We never have access to your private keys, seed phrases, or wallet credentials. All transactions are signed locally in your browser wallet and submitted directly to the Monad Testnet. We cannot reverse, modify, or cancel confirmed transactions.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">6. Disclaimer of Warranties</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee uninterrupted access, error-free operation, or the accuracy of price data. Smart contracts may contain bugs or vulnerabilities. Use at your own risk.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">7. Limitation of Liability</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            In no event shall PulseStock, its developers, or contributors be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the Platform. Since all assets are testnet tokens with no real value, no financial loss can occur through normal Platform usage.
          </p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">8. Contact</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            For questions about these terms, contact us at <span className="text-white font-mono">team@pulsestock.dev</span>.
          </p>
        </div>
      </div>
    </ContentPageLayout>
  )
}
