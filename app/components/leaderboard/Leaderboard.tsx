"use client"

import { useEffect, useState } from "react"
import { useWatchContractEvent } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Trophy, TrendingUp } from "lucide-react"
import { formatUnits } from "@/lib/utils"
import { STOCK_AMM_ADDRESS, stockAmmAbi, STOCKS } from "@/lib/contracts/contracts"
import { useReadContract } from "wagmi"

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
    args: [0],
    query: { refetchInterval: 5000 },
  })

  useWatchContractEvent({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    eventName: "Trade",
    onLogs: (logs) => {
      logs.forEach((log) => {
        const { user, stockId, isBuy, amountOut } = log.args
        const addr = user.toLowerCase()

        setPortfolios((prev) => {
          const existing = prev.find((p) => p.address === addr)
          const shares = { ...(existing?.shares || {}) }
          shares[Number(stockId)] = (shares[Number(stockId)] || 0n) + (isBuy ? amountOut : -amountOut)

          const newPortfolio: PortfolioData = {
            addr,
            shares,
            cash: existing?.cash || 0n,
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
          Object.entries(p.shares).forEach(([stockId, shares]) => {
            total += (Number(shares) / 1e18) * (Number(prices) / 1e18)
          })
          return { ...p, totalValue: total }
        })
      )
    }
  }, [prices])

  const sorted = [...portfolios].sort((a, b) => b.totalValue - a.totalValue)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No trades yet. Be the first to trade!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.slice(0, 10).map((p, i) => (
                <TableRow key={p.address}>
                  <TableCell className="font-bold">
                    {i === 0 && <Trophy className="h-4 w-4 text-yellow-500 inline" />}
                    {i + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {p.address.slice(0, 6)}...{p.address.slice(-4)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {p.totalValue.toFixed(2)} SUSD
                    <TrendingUp className="h-3 w-3 inline text-green-500 ml-1" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}