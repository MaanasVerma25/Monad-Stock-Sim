"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { Target, Users, Rocket, Lightbulb } from "lucide-react"

export default function AboutPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        About PulseStock
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Building the bridge between traditional equity markets and decentralized on-chain trading infrastructure.
      </p>

      {/* Mission */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            PulseStock was conceived to demonstrate that real-world equity price dynamics can be faithfully replicated on-chain using bonding curve mechanics. Our mission is to prove that DeFi primitives — constant-product AMMs, ERC-20 tokens, and oracle-fed price anchors — can create synthetic equity markets with institutional-grade responsiveness.
          </p>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            By running on Monad&apos;s parallel EVM with sub-second finality, PulseStock showcases what next-generation Layer 1 infrastructure can deliver: real-time price discovery, zero-slippage settlement, and transparent on-chain execution — all without centralized order books or custodial intermediaries.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Synthetic Market Vision</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            We believe the future of financial markets is permissionless, composable, and fully auditable. PulseStock is a prototype of that future — where anyone with a browser wallet can trade equity-linked instruments 24/7, without KYC barriers, geographic restrictions, or minimum account sizes.
          </p>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            Our synthetic engine anchors to real closing prices daily, creating a hybrid model that maintains parity with traditional markets while leveraging the speed and transparency of on-chain settlement. This is not a replacement for regulated securities — it&apos;s a demonstration of the DeFi primitives that will power next-generation financial infrastructure.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">The Team</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-6">
            PulseStock was built by a focused engineering team combining expertise in smart contract development, DeFi protocol design, and institutional-grade frontend engineering.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-black/60 border border-white/10 rounded-xl p-5 hover:border-white/30 transition-all duration-300">
              <p className="text-white font-semibold text-base mb-1">Maanas Verma</p>
              <p className="text-zinc-400 text-sm">Full-Stack & Smart Contract Developer</p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-5 hover:border-white/30 transition-all duration-300">
              <p className="text-white font-semibold text-base mb-1">Pratyush Gupta</p>
              <p className="text-zinc-400 text-sm">Frontend Developer</p>
            </div>
            <div className="bg-black/60 border border-white/10 rounded-xl p-5 hover:border-white/30 transition-all duration-300">
              <p className="text-white font-semibold text-base mb-1">Core Contributors</p>
              <p className="text-zinc-400 text-sm">DeFi protocol design & frontend engineering</p>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section>
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Infrastructure</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            PulseStock leverages Monad&apos;s high-throughput parallel EVM for latency-sensitive financial applications.
          </p>
        </div>
      </section>
    </ContentPageLayout>
  )
}
