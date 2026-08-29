"use client"

import { useAccount, useReadContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { formatUnits, formatPrice } from "@/lib/utils"
import { PLAY_MONEY_ADDRESS, playMoneyAbi, STOCK_AMM_ADDRESS, stockAmmAbi, STOCKS } from "@/lib/contracts/contracts"
import { Sparkles } from "lucide-react"

export function Portfolio() {
  const { address, isConnected } = useAccount()

  const { data: cashBalance } = useReadContract({
    address: PLAY_MONEY_ADDRESS,
    abi: playMoneyAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  })

  const holdings = STOCKS.map((stock) => {
    const { data: stockData } = useReadContract({
      address: STOCK_AMM_ADDRESS,
      abi: stockAmmAbi,
      functionName: "getStock",
      args: [BigInt(stock.id)],
      query: { refetchInterval: 3000 },
    })

    const { data: price } = useReadContract({
      address: STOCK_AMM_ADDRESS,
      abi: stockAmmAbi,
      functionName: "getPrice",
      args: [BigInt(stock.id)],
      query: { refetchInterval: 3000 },
    })

    const { data: shares } = useReadContract({
      address: STOCK_AMM_ADDRESS,
      abi: stockAmmAbi,
      functionName: "getUserShares",
      args: address ? [address, BigInt(stock.id)] : undefined,
      query: { enabled: !!address, refetchInterval: 3000 },
    })

    const displayTicker = stockData?.[0] || stock.ticker
    const displayName = stockData?.[1] || stock.name
    const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : 0

    const numShares = typeof shares === "bigint" ? Number(shares) / 1e18 : 0
    const numPrice = typeof price === "bigint" ? Number(price) / 1e18 : (stockData?.[6] ? Number(stockData[6]) / 1e18 : basePrice)
    const value = numShares * numPrice

    return { stock, displayTicker, displayName, basePrice, price, shares, numShares, numPrice, value }
  })

  const totalPositionsValue = holdings.reduce((acc, h) => acc + h.value, 0)
  const cashVal = typeof cashBalance === "bigint" ? Number(cashBalance) / 1e18 : 0
  const totalValue = cashVal + totalPositionsValue

  if (!isConnected) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border border-white/10 p-8 rounded-2xl shadow-2xl">
        <CardContent className="p-0 text-center">
          <p className="text-slate-300">Connect wallet to view portfolio valuation</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="font-serif text-2xl font-bold text-slate-100">Asset Holdings & Valuation</CardTitle>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4 bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Total Net Portfolio Value</div>
            <div className="font-serif text-3xl font-bold text-white drop-shadow-sm">
              ${totalValue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Liquid Cash Balance</div>
            <div className="font-mono text-2xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]">
              {typeof cashBalance === "bigint" ? `${formatUnits(cashBalance)} MON` : "0.0000 MON"}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-transparent relative">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="bg-transparent border-b border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-300 font-mono text-xs uppercase font-semibold">Ticker</TableHead>
                <TableHead className="text-slate-300 font-mono text-xs uppercase font-semibold">Company</TableHead>
                <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">24h Anchor</TableHead>
                <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Spot Price</TableHead>
                <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Held Quantity</TableHead>
                <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Position Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-transparent divide-y divide-white/10">
              {holdings.map(({ stock, displayTicker, displayName, basePrice, price, shares, value }) => (
                <TableRow key={stock.id} className="hover:bg-white/[0.05] bg-transparent border-b border-white/10 transition-colors">
                  <TableCell className="font-serif font-bold text-white text-base">{displayTicker}</TableCell>
                  <TableCell className="text-slate-300 text-sm">{displayName}</TableCell>
                  <TableCell className="text-right font-mono text-red-500 font-medium">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5 align-middle" />
                    ${basePrice > 0 ? basePrice.toFixed(2) : "..."}
                  </TableCell>
                  <TableCell className="text-right font-mono text-white font-semibold">
                    {typeof price === "bigint" ? `$${formatPrice(price)}` : (basePrice > 0 ? `$${basePrice.toFixed(2)}` : "...")}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">
                    {typeof shares === "bigint" ? `${(Number(shares) / 1e18).toFixed(4)}` : "0.0000"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">
                    ${value.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Glowing Spark Element on Far-Right Table Edge */}
          <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1 text-emerald-300/80">
            <Sparkles className="h-4 w-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-pulse" />
          </div>
        </div>

        <p className="text-xs font-mono text-slate-400 flex items-center justify-between">
          <span>* Live share balances updated via on-chain StockAMM.getUserShares queries on Monad Testnet.</span>
        </p>
      </CardContent>
    </Card>
  )
}