"use client"

import { ContentPageLayout } from "@/components/ContentPageLayout"
import { Gift, Users, TrendingUp, Award } from "lucide-react"

export default function AffiliatePage() {
  return (
    <ContentPageLayout>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        Affiliate & Referral Program
      </h1>
      <p className="text-[#9a9a9a] text-lg mb-12 leading-relaxed">
        Earn bonus MON and leaderboard rewards by referring new traders to PulseStock on Monad Testnet.
      </p>

      {/* How It Works */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">How It Works</h2>
          </div>
          <p className="text-[#9a9a9a] text-sm leading-relaxed mb-6">
            The PulseStock referral program rewards users who bring new traders to the platform. Since all assets are testnet tokens, referral rewards are distributed in MON and leaderboard points.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black rounded-lg border border-white/10 p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-mono font-bold text-sm">1</span>
              </div>
              <p className="text-white text-sm font-semibold mb-1">Share Your Link</p>
              <p className="text-[#9a9a9a] text-xs">Generate a unique referral link from your portfolio page and share it with traders.</p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-mono font-bold text-sm">2</span>
              </div>
              <p className="text-white text-sm font-semibold mb-1">They Trade</p>
              <p className="text-[#9a9a9a] text-xs">When your referral connects their wallet, claims MON, and executes their first trade, the referral is activated.</p>
            </div>
            <div className="bg-black rounded-lg border border-white/10 p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-mono font-bold text-sm">3</span>
              </div>
              <p className="text-white text-sm font-semibold mb-1">Earn Rewards</p>
              <p className="text-[#9a9a9a] text-xs">Both you and your referral receive bonus MON and leaderboard points upon activation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reward Tiers */}
      <section className="mb-8">
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-5 w-5 text-white" />
            <h2 className="text-2xl font-bold text-white">Reward Tiers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-[#9a9a9a] text-xs font-mono uppercase">Tier</th>
                  <th className="py-3 px-4 text-[#9a9a9a] text-xs font-mono uppercase">Referrals</th>
                  <th className="py-3 px-4 text-[#9a9a9a] text-xs font-mono uppercase">Reward (MON)</th>
                  <th className="py-3 px-4 text-[#9a9a9a] text-xs font-mono uppercase">Bonus</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white font-semibold">Bronze</td>
                  <td className="py-3 px-4 text-[#9a9a9a]">1–5</td>
                  <td className="py-3 px-4 text-white font-mono">10,000 MON</td>
                  <td className="py-3 px-4 text-[#9a9a9a]">Per referral</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white font-semibold">Silver</td>
                  <td className="py-3 px-4 text-[#9a9a9a]">6–15</td>
                  <td className="py-3 px-4 text-white font-mono">15,000 MON</td>
                  <td className="py-3 px-4 text-[#9a9a9a]">Per referral + Leaderboard badge</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3 px-4 text-white font-semibold">Gold</td>
                  <td className="py-3 px-4 text-[#9a9a9a]">16–50</td>
                  <td className="py-3 px-4 text-white font-mono">25,000 MON</td>
                  <td className="py-3 px-4 text-[#9a9a9a]">Per referral + Featured profile</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-white font-semibold">Platinum</td>
                  <td className="py-3 px-4 text-[#9a9a9a]">50+</td>
                  <td className="py-3 px-4 text-white font-mono">50,000 MON</td>
                  <td className="py-3 px-4 text-[#9a9a9a]">Per referral + Ambassador status</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Terms */}
      <section>
        <div className="border border-white/10 bg-zinc-950/60 rounded-xl p-8">
          <h2 className="text-xl font-bold text-white mb-3">Program Terms</h2>
          <ul className="space-y-2 text-[#9a9a9a] text-sm">
            <li>• All rewards are distributed in MON, a testnet token with no real monetary value.</li>
            <li>• Self-referrals (referring your own wallets) are detected and will not count toward rewards.</li>
            <li>• Referrals must complete at least one trade to activate the referral reward.</li>
            <li>• PulseStock reserves the right to modify or terminate the referral program at any time.</li>
            <li>• Abuse of the referral system (bot registrations, sybil attacks) will result in disqualification.</li>
          </ul>
        </div>
      </section>
    </ContentPageLayout>
  )
}
