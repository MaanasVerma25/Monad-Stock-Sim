"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { BookOpen, Code2, Activity, Cpu, Database, GitBranch } from "lucide-react"

export default function DocsPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Documentation
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Technical reference for PulseStock&apos;s synthetic equity engine, bonding curve mechanics, and smart contract architecture.
      </p>

      {/* Architecture Overview */}
      <section className="mb-12">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Architecture Overview</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-4">
            PulseStock operates a fully on-chain synthetic equity trading engine on Monad Testnet. The system consists of three core layers:
          </p>
          <ul className="space-y-3 text-[#9a9a9a] text-sm">
            <li className="flex items-start gap-2">
              <span className="text-white font-mono text-xs mt-1">01</span>
              <span><strong className="text-white">Smart Contract Layer</strong> — StockAMM.sol implements constant-product bonding curves (x · y = k) for each synthetic equity pair, with 24-hour base price re-anchoring.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-mono text-xs mt-1">02</span>
              <span><strong className="text-white">Oracle Integration Layer</strong> — Real-world equity closing prices (via Marketstack API) are ingested daily to recalibrate each stock&apos;s base price, preventing synthetic drift.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-mono text-xs mt-1">03</span>
              <span><strong className="text-white">Frontend Terminal</strong> — Next.js 14 application with wagmi/viem for direct contract interaction, real-time chart rendering, and institutional-grade UI.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Monad Architecture & Execution Rules */}
      <section className="mb-12">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="h-5 w-5 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Monad Execution Rules</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-6">
            PulseStock leverages Monad&apos;s high-performance Layer 1 architecture. Key execution characteristics include:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-black rounded-lg border border-white/10 p-5">
              <h3 className="text-white font-mono text-sm font-bold mb-2">⚡ 400ms Blocks & 800ms Finality</h3>
              <p className="text-[#9a9a9a] text-xs leading-relaxed">
                Blocks are produced every 400ms and achieve irreversible finality in 800ms across 10,000 TPS network capacity.
              </p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-5">
              <h3 className="text-white font-mono text-sm font-bold mb-2">⛽ Gas Charged on Gas Limit</h3>
              <p className="text-[#9a9a9a] text-xs leading-relaxed">
                Monad charges gas as <code className="text-white">gas_limit × price_per_gas</code>. PulseStock sets tight, explicit gas limits (~60k approval, ~150k trade) so users don&apos;t overpay.
              </p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-5">
              <h3 className="text-white font-mono text-sm font-bold mb-2">🔄 Asynchronous Execution (D=3)</h3>
              <p className="text-[#9a9a9a] text-xs leading-relaxed">
                Consensus and execution run asynchronously with a 3-block delayed state view (~1.2s). Newly funded accounts become usable after ~1.2s.
              </p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-5">
              <h3 className="text-white font-mono text-sm font-bold mb-2">🛡️ 10 MON Reserve Floor</h3>
              <p className="text-[#9a9a9a] text-xs leading-relaxed">
                Monad enforces a 10 MON safety floor per EOA to protect asynchronous consensus. Accounts below 10 MON are throttled to 1 tx per ~1.2s.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bonding Curve Formula */}
      <section className="mb-12">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Bonding Curve Formula</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-6">
            Each synthetic stock maintains two reserves managed by a constant-product automated market maker:
          </p>
          <div className="bg-black rounded-lg border border-white/10 p-6 mb-6">
            <code className="text-white font-mono text-sm block mb-2">cashReserve × shareReserve = k (invariant)</code>
            <code className="text-[#9a9a9a] font-mono text-xs block mb-4">spotPrice = cashReserve / shareReserve</code>
            <p className="text-[#9a9a9a] text-xs font-mono">
              When a user buys N shares: cashIn = (cashReserve × N) / (shareReserve − N)
            </p>
            <p className="text-[#9a9a9a] text-xs font-mono">
              When a user sells N shares: cashOut = (cashReserve × N) / (shareReserve + N)
            </p>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            The bonding curve uses high-sensitivity parameters (shareLiquidity = 1000 × 10¹⁸) to amplify price impact per trade, creating volatile intraday price action that mirrors real equity market microstructure.
          </p>
        </div>
      </section>

      {/* Smart Contract API */}
      <section className="mb-12">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Smart Contract API</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-black rounded-lg border border-white/10 p-4">
              <h3 className="text-white font-mono text-sm font-bold mb-2">buyShares(uint256 stockId, uint256 amount)</h3>
              <p className="text-[#9a9a9a] text-xs">Purchase synthetic shares. Requires prior MON approval. Returns actual cost computed by bonding curve.</p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-4">
              <h3 className="text-white font-mono text-sm font-bold mb-2">sellShares(uint256 stockId, uint256 amount)</h3>
              <p className="text-[#9a9a9a] text-xs">Sell synthetic shares back to the AMM. Returns MON proceeds based on current curve state.</p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-4">
              <h3 className="text-white font-mono text-sm font-bold mb-2">getPrice(uint256 stockId) → uint256</h3>
              <p className="text-[#9a9a9a] text-xs">Returns the current spot price (cashReserve / shareReserve) scaled to 18 decimals.</p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-4">
              <h3 className="text-white font-mono text-sm font-bold mb-2">getStock(uint256 stockId) → StockInfo</h3>
              <p className="text-[#9a9a9a] text-xs">Returns full stock metadata: ticker, name, cashReserve, shareReserve, basePrice, lastReset.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deployed Contracts */}
      <section className="mb-12">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Deployed Contracts</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-black rounded-lg border border-white/10 p-4">
              <p className="text-white text-sm font-semibold mb-1">StockAMM</p>
              <p className="text-[#9a9a9a] text-xs font-mono break-all">Core bonding curve AMM contract — Monad Testnet</p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-4">
              <p className="text-white text-sm font-semibold mb-1">MON Token</p>
              <p className="text-[#9a9a9a] text-xs font-mono break-all">Monad testnet asset / token for trading — Faucet-mintable</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <GitBranch className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Technology Stack</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {["Next.js 14", "TypeScript", "wagmi / viem", "Solidity 0.8.x", "Foundry", "Recharts", "Monad Testnet", "Alpha Vantage API", "Tailwind CSS"].map((tech) => (
              <div key={tech} className="bg-black rounded-lg border border-white/10 px-4 py-3 text-center">
                <span className="text-white text-sm font-mono">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ContentPageLayout>
  )
}
