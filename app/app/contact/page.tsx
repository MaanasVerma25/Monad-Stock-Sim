"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { Mail, MessageSquare, Github, Twitter } from "lucide-react"

export default function ContactPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Contact Us
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Reach out for developer inquiries, partnership proposals, or technical support.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-white" />
            <h2 className="text-xl font-bold text-white">Email</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-3">
            For general inquiries, developer support, and partnership proposals:
          </p>
          <p className="text-white text-sm font-mono">team@pulsestock.dev</p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Github className="h-5 w-5 text-white" />
            <h2 className="text-xl font-bold text-white">GitHub</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-3">
            Report bugs, request features, or contribute to the open-source codebase:
          </p>
          <p className="text-white text-sm font-mono">github.com/MaanasVerma25/Monad-Stock-Sim</p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Twitter className="h-5 w-5 text-white" />
            <h2 className="text-xl font-bold text-white">Social</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-3">
            Follow us for platform updates, feature announcements, and DeFi research:
          </p>
          <p className="text-white text-sm font-mono">@PulseStockHQ</p>
        </div>

        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-5 w-5 text-white" />
            <h2 className="text-xl font-bold text-white">Discord</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-3">
            Join the community for real-time discussion, trading strategies, and support:
          </p>
          <p className="text-white text-sm font-mono">discord.gg/pulsestock</p>
        </div>
      </div>

      {/* Developer Inquiry */}
      <section>
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Developer Inquiries</h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-6">
            If you&apos;re building on Monad and want to integrate PulseStock&apos;s bonding curve infrastructure, or fork the protocol for your own synthetic asset deployment, we&apos;re happy to help. The codebase is open-source under MIT license.
          </p>
          <div className="bg-black rounded-lg border border-white/10 p-4">
            <p className="text-[#9a9a9a] text-xs font-mono">
              Smart contracts: Solidity 0.8.x / Foundry • Frontend: Next.js 14 / wagmi / viem • License: MIT
            </p>
          </div>
        </div>
      </section>
    </ContentPageLayout>
  )
}
