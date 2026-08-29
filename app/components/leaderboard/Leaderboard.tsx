"use client"

import { useEffect, useState } from "react"
import { useWatchContractEvent, useReadContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Trophy, TrendingUp } from "lucide-react"
import { STOCK_AMM_ADDRESS, stockAmmAbi } from "@/lib/contracts/contracts"

interface PortfolioData {
  address: string
  shares: Record<number, bigint>
  cash: bigint
  totalValue: number
}

export function Leaderboard() {
  const [portfolios, setPortfolios] = useState<PortfolioData[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const { data: prices } = useReadContract({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    functionName: "getPrice",
    args: [BigInt(0)],
    query: { refetchInterval: 5000 },
  })

  useWatchContractEvent({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    eventName: "Trade",
    onLogs: (logs) => {
      logs.forEach((log: any) => {
        if (!log.args) return
        const { user, stockId, isBuy, amountOut } = log.args
        const addr = user ? user.toLowerCase() : ""
        if (!addr) return

        setPortfolios((prev) => {
          const existing = prev.find((p) => p.address === addr)
          const shares = { ...(existing?.shares || {}) }
          const curShare = shares[Number(stockId)] || BigInt(0)
          shares[Number(stockId)] = curShare + (isBuy ? amountOut : -amountOut)

          const newPortfolio: PortfolioData = {
            address: addr,
            shares,
            cash: existing?.cash || BigInt(0),
            totalValue: 0,
          }
          return existing ? prev.map((p) => (p.address === addr ? newPortfolio : p)) : [...prev, newPortfolio]
        })
      })
      setLastUpdate(new Date())
    },
  })

  useEffect(() => {
    if (prices) {
      setPortfolios((prev) =>
        prev.map((p) => {
          let total = Number(p.cash) / 1e18
          Object.entries(p.shares).forEach(([_, shares]) => {
            total += (Number(shares) / 1e18) * (Number(prices) / 1e18)
          })
          return { ...p, totalValue: total }
        })
      )
    }
  }, [prices])

  const sorted = [...portfolios].sort((a, b) => b.totalValue - a.totalValue)

  return (
    <Card className="bg-zinc-950/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-6">
      <CardHeader className="p-0 mb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-2xl font-bold text-white flex items-center gap-3">
            <Trophy className="w-6 h-6 text-slate-200 drop-shadow-[0_0_8px_rgba(226,232,240,0.8)] filter brightness-125" />
            Trader Leaderboard & Ranking
          </CardTitle>
          <span className="text-xs font-mono text-zinc-300 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-md border border-white/10 shadow-sm">
            Live Feed: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length === 0 ? (
          <div className="bg-zinc-900/60 backdrop-blur-md p-12 text-center rounded-xl border border-white/10 text-zinc-300">
            <p className="font-serif text-lg font-semibold text-white mb-1">No Trade Events Recorded Yet</p>
            <p className="text-sm text-zinc-400">Initiate a buy or sell order on the Trade tab to rank on the global leaderboard.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/40 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-900/80 border-b border-white/10 hover:bg-zinc-900/80">
                  <TableHead className="text-zinc-400 font-mono text-xs uppercase font-semibold w-24">Rank</TableHead>
                  <TableHead className="text-zinc-400 font-mono text-xs uppercase font-semibold">Wallet Address</TableHead>
                  <TableHead className="text-right text-zinc-400 font-mono text-xs uppercase font-semibold">Net Portfolio Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/10">
                {sorted.slice(0, 10).map((p, i) => (
                  <TableRow key={p.address} className="hover:bg-zinc-800/50 bg-zinc-950/40 border-b border-white/10 transition-colors">
                    <TableCell className="font-serif font-bold text-white text-base">
                      {i === 0 && <Trophy className="w-4 h-4 text-slate-200 drop-shadow-[0_0_6px_rgba(226,232,240,0.8)] filter brightness-125 inline mr-2" />}
                      #{i + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-zinc-200 font-medium">
                      {p.address.slice(0, 8)}...{p.address.slice(-6)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-emerald-400">
                      ${p.totalValue.toFixed(2)}
                      <TrendingUp className="h-3.5 w-3.5 inline text-emerald-400 ml-1.5" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}