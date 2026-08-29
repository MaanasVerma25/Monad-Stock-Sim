"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { HelpCircle, ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "What are synthetic assets on PulseStock?",
    a: "Synthetic assets on PulseStock are on-chain token pairs that mirror the price behavior of real-world equities (AAPL, TSLA, NVDA, GOOGL, MSFT, AMZN, META, COIN). They are not actual securities — they are simulated positions backed by a bonding curve AMM on Monad Testnet. Base prices are re-anchored daily to real market closing prices via oracle feeds."
  },
  {
    q: "How does the bonding curve determine prices?",
    a: "Each stock maintains a constant-product bonding curve: cashReserve × shareReserve = k. The spot price at any moment is cashReserve / shareReserve. When you buy shares, you deposit MON into the cash reserve and remove shares from the share reserve, pushing the price up. Selling does the reverse. The curve uses high-sensitivity liquidity parameters (1000 × 10¹⁸ share reserves) to create volatile, responsive price action."
  },
  {
    q: "What is MON play money?",
    a: "MON is the native token / testnet asset deployed on Monad Testnet. Every new user can claim 100,000 MON through the onboarding flow. MON play money has zero financial risk — it exists for simulation and testing purposes."
  },
  {
    q: "How fast are trades executed?",
    a: "PulseStock runs on Monad's parallel EVM with 400ms block times and 800ms finality. Trades are confirmed on-chain in sub-second time. The frontend uses contract event listeners to update charts and positions instantly."
  },
  {
    q: "Why is gas calculated on gas limit on Monad?",
    a: "Unlike Ethereum where gas is charged on actual gas used, Monad uses asynchronous execution where block leaders build blocks before executing them. Monad charges gas based on gas_limit (gas_paid = gas_limit × price_per_gas). PulseStock sets tight explicit gas limits on all contract calls to keep fees minimal."
  },
  {
    q: "What is the 10 MON reserve balance floor?",
    a: "Monad enforces a 10 MON reserve floor per EOA to protect asynchronous consensus execution. If an account's balance drops below 10 MON, transactions are throttled to 1 per ~1.2s. PulseStock displays a visual indicator when your native MON balance is close to the reserve floor."
  },
  {
    q: "How are real-world prices integrated?",
    a: "Base prices for each stock are fetched from Alpha Vantage API live feeds, which provide real equity closing prices. Every 24 hours, the contract owner can call resetBasePrice() to re-anchor each stock's bonding curve to the latest real closing price, preventing long-term synthetic drift."
  },
  {
    q: "Is this real money or real trading?",
    a: "No. PulseStock is a testnet trading simulation. All assets (MON, stock shares) are testnet tokens with zero real-world value. No actual equities are bought, sold, or held. This is a demonstration of DeFi bonding curve mechanics applied to equity-like instruments."
  },
  {
    q: "What wallets are supported?",
    a: "PulseStock supports any EVM-compatible browser wallet, including MetaMask, Rabby, Rainbow, and Coinbase Wallet. You need to add the Monad Testnet network to your wallet (Chain ID: 10143, RPC: https://testnet-rpc.monad.xyz). See our Wallet Guide for step-by-step instructions."
  },
  {
    q: "What happens when the bonding curve resets?",
    a: "When the owner calls resetBasePrice(), the contract recalculates cashReserve to align with the new real-world closing price while maintaining the same shareReserve. This shifts the spot price to match reality without liquidating any positions. Your share balances remain unchanged."
  },
  {
    q: "Can I lose my testnet funds?",
    a: "Your MON balance can decrease if you buy shares at a high price and sell at a lower price — exactly like real trading. However, since all funds are testnet tokens, there is no financial risk. You can always claim more MON from the faucet."
  },
  {
    q: "Is the smart contract audited?",
    a: "The StockAMM contract is a testnet demonstration and has not undergone a formal security audit. The code is open-source and available on GitHub for review. Do not deploy this contract with real assets without a comprehensive audit."
  },
]

export default function FaqsPage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Frequently Asked Questions
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Everything you need to know about synthetic equity settlement, Monad EVM execution, and PulseStock&apos;s liquidity mechanics.
      </p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group border border-white/10 bg-zinc-950/60 rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
              <div className="flex items-center gap-3">
                <span className="text-white font-mono text-xs opacity-40">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-white font-semibold text-sm md:text-base">{faq.q}</h3>
              </div>
              <ChevronDown className="h-4 w-4 text-[#9a9a9a] shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-6 pb-6 pt-0">
              <p className="text-[#9a9a9a] text-sm leading-relaxed pl-8">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </ContentPageLayout>
  )
}
