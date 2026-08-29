"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { PenTool, Clock, Tag } from "lucide-react"

const posts = [
  {
    date: "Aug 28, 2026",
    tag: "Engineering",
    title: "Constant-Product Bonding Curves for Synthetic Equities",
    excerpt: "A deep technical exploration of how PulseStock adapts Uniswap's x·y=k formula for equity-linked synthetic assets. We discuss reserve calibration, sensitivity tuning, and the 24-hour base price re-anchoring mechanism that prevents synthetic drift from real market closing prices.",
  },
  {
    date: "Aug 27, 2026",
    tag: "Infrastructure",
    title: "Sub-Second Finality: Why Monad Changes Everything for DeFi Trading",
    excerpt: "Traditional DEXes suffer from latency in price updates due to 12-second block times on Ethereum. Monad's parallel EVM delivers sub-second finality, enabling PulseStock to offer institutional-grade execution speeds. This post examines how we leverage contract events for real-time chart updates without WebSocket infrastructure.",
  },
  {
    date: "Aug 26, 2026",
    tag: "Design",
    title: "The Vesper Liquid-Glass Design System: Building a Premium Trading Terminal",
    excerpt: "How we designed PulseStock's pitch-black, translucent glass aesthetic inspired by the Vesper.ai template. Covers the design token system (glass borders, backdrop blur, metallic typography), Instrument Serif editorial accents, and the full-viewport video background implementation.",
  },
  {
    date: "Aug 25, 2026",
    tag: "Protocol",
    title: "Oracle-Fed Price Anchoring: Bridging TradFi and DeFi",
    excerpt: "PulseStock ingests real equity closing prices from Marketstack's API and writes them on-chain every 24 hours. This post explains the oracle integration pipeline, the resetBasePrice() mechanism, and how bonding curve reserves are recalibrated without liquidating user positions.",
  },
  {
    date: "Aug 24, 2026",
    tag: "Smart Contracts",
    title: "StockAMM.sol: Architecture of a Multi-Asset Bonding Curve Engine",
    excerpt: "A line-by-line walkthrough of PulseStock's core Solidity contract. We cover the StockInfo struct, batch stock registration, buy/sell share mechanics, price calculation, and the admin-only base price reset function. Includes Foundry test patterns for bonding curve invariant verification.",
  },
]

export default function BlogPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Engineering Blog
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Technical posts on high-frequency synthetic trading, Monad EVM execution, bonding curve mathematics, and DeFi protocol design.
      </p>

      <div className="space-y-6">
        {posts.map((post, i) => (
          <article
            key={i}
            className="border border-white/10 bg-zinc-950/60 rounded-xl p-8 hover:border-white/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[#9a9a9a] text-xs font-mono flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> {post.date}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white flex items-center gap-1">
                <Tag className="h-3 w-3" /> {post.tag}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
            <p className="text-[#9a9a9a] text-sm leading-relaxed">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </ContentPageLayout>
  )
}
