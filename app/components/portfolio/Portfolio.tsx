"use client"

import { useAccount, useReadContract, useBalance, useWatchContractEvent } from "wagmi"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { STOCK_AMM_ADDRESS, stockAmmAbi, STOCKS } from "@/lib/contracts/contracts"
import { Sparkles, Wallet, ArrowUpRight, ArrowDownRight, Activity, Clock, ExternalLink } from "lucide-react"

interface TradeEvent {
  txHash: string
  stockId: number
  ticker: string
  isBuy: boolean
  amountIn: string
  amountOut: string
  newPrice: string
  timestamp: Date
}

export function Portfolio() {
  const { address, isConnected } = useAccount()
  const [tradeHistory, setTradeHistory] = useState<TradeEvent[]>([])

  // Read native MON balance from MetaMask wallet
  const { data: monBalance, refetch: refetchMonBalance } = useBalance({
    address,
    query: { enabled: !!address, refetchInterval: 3000 },
  })

  // Watch for live Trade events from the user
  useWatchContractEvent({
    address: STOCK_AMM_ADDRESS,
    abi: stockAmmAbi,
    eventName: "Trade",
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.user?.toLowerCase() === address?.toLowerCase()) {
          const stockId = Number(log.args.stockId)
          const ticker = STOCKS.find(s => s.id === stockId)?.ticker || `ID-${stockId}`
          const isBuy = log.args.isBuy ?? false
          const amountIn = log.args.amountIn ? (Number(log.args.amountIn) / 1e18).toFixed(4) : "0"
          const amountOut = log.args.amountOut ? (Number(log.args.amountOut) / 1e18).toFixed(4) : "0"
          const newPrice = log.args.newPrice ? (Number(log.args.newPrice) / 1e18).toFixed(4) : "0"

          const newTrade: TradeEvent = {
            txHash: log.transactionHash || "",
            stockId,
            ticker,
            isBuy,
            amountIn,
            amountOut,
            newPrice,
            timestamp: new Date(),
          }

          setTradeHistory((prev) => [newTrade, ...prev].slice(0, 50))

          // Refetch balances after detecting own trade
          refetchMonBalance()
        }
      })
    },
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

    const { data: shares, refetch: refetchShares } = useReadContract({
      address: STOCK_AMM_ADDRESS,
      abi: stockAmmAbi,
      functionName: "getUserShares",
      args: address ? [address, BigInt(stock.id)] : undefined,
      query: { enabled: !!address, refetchInterval: 2000 },
    })

    const displayTicker = stockData?.[0] || stock.ticker
    const displayName = stockData?.[1] || stock.name
    const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : 0

    const numShares = typeof shares === "bigint" ? Number(shares) / 1e18 : 0
    const numPrice = typeof price === "bigint" ? Number(price) / 1e18 : (stockData?.[6] ? Number(stockData[6]) / 1e18 : basePrice)
    const value = numShares * numPrice

    return { stock, displayTicker, displayName, basePrice, price, shares, numShares, numPrice, value }
  })

  const activeHoldings = holdings.filter(h => h.numShares > 0)
  const totalPositionsValue = holdings.reduce((acc, h) => acc + h.value, 0)
  const cashVal = monBalance ? Number(monBalance.formatted) : 0
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
    <div className="space-y-8">
      {/* Portfolio Summary Card */}
      <Card className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-400" />
            Native MON Portfolio & Asset Holdings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          {/* Summary Stats */}
          <div className="grid sm:grid-cols-3 gap-4 bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Total Portfolio Value</div>
              <div className="font-serif text-3xl font-bold text-white drop-shadow-sm">
                ${totalValue.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Native MON Balance</div>
              <div className="font-mono text-2xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]">
                {monBalance ? `${Number(monBalance.formatted).toFixed(4)} MON` : "0.0000 MON"}
              </div>
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">Active Positions</div>
              <div className="font-mono text-2xl font-bold text-white">
                {activeHoldings.length} / {STOCKS.length}
              </div>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-transparent relative">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="bg-transparent border-b border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-300 font-mono text-xs uppercase font-semibold">Ticker</TableHead>
                  <TableHead className="text-slate-300 font-mono text-xs uppercase font-semibold">Company</TableHead>
                  <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">24h Anchor</TableHead>
                  <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Spot Price</TableHead>
                  <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Held Qty</TableHead>
                  <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Position Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-transparent divide-y divide-white/10">
                {holdings.map(({ stock, displayTicker, displayName, basePrice, price, shares, numShares, value }) => (
                  <TableRow
                    key={stock.id}
                    className={`bg-transparent border-b border-white/10 transition-colors ${numShares > 0 ? "hover:bg-emerald-500/[0.06]" : "hover:bg-white/[0.03] opacity-60"}`}
                  >
                    <TableCell className="font-serif font-bold text-white text-base">
                      {displayTicker}
                      {numShares > 0 && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    </TableCell>
                    <TableCell className="text-slate-300 text-sm">{displayName}</TableCell>
                    <TableCell className="text-right font-mono text-red-500 font-medium">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5 align-middle" />
                      ${basePrice > 0 ? basePrice.toFixed(2) : "..."}
                    </TableCell>
                    <TableCell className="text-right font-mono text-white font-semibold">
                      {typeof price === "bigint" ? `$${formatPrice(price)}` : (basePrice > 0 ? `$${basePrice.toFixed(2)}` : "...")}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-semibold ${numShares > 0 ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" : "text-slate-500"}`}>
                      {numShares > 0 ? numShares.toFixed(4) : "—"}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold ${numShares > 0 ? "text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]" : "text-slate-500"}`}>
                      {numShares > 0 ? `$${value.toFixed(2)}` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1 text-emerald-300/80">
              <Sparkles className="h-4 w-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)] animate-pulse" />
            </div>
          </div>

          <p className="text-xs font-mono text-slate-400">
            * Live share balances auto-refresh every 2s via on-chain StockAMM.getUserShares on Monad Testnet.
          </p>
        </CardContent>
      </Card>

      {/* Transaction History Card */}
      <Card className="bg-black/40 backdrop-blur-sm border border-white/10 p-6 rounded-2xl shadow-2xl">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="h-6 w-6 text-white" />
            Live Transaction History
            {tradeHistory.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 font-mono text-xs">
                {tradeHistory.length} trades
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tradeHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Clock className="h-10 w-10 mx-auto text-slate-500" />
              <p className="font-medium text-sm">No transactions yet in this session</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Execute a buy or sell trade on any stock from the Dashboard or Trade page. Your transactions will appear here in real time as they finalize on Monad.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="bg-transparent border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-300 font-mono text-xs uppercase font-semibold">Time</TableHead>
                    <TableHead className="text-slate-300 font-mono text-xs uppercase font-semibold">Type</TableHead>
                    <TableHead className="text-slate-300 font-mono text-xs uppercase font-semibold">Stock</TableHead>
                    <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Spent</TableHead>
                    <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Received</TableHead>
                    <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">New Spot Price</TableHead>
                    <TableHead className="text-right text-slate-300 font-mono text-xs uppercase font-semibold">Tx</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-transparent divide-y divide-white/10">
                  {tradeHistory.map((trade, i) => (
                    <TableRow key={`${trade.txHash}-${i}`} className="hover:bg-white/[0.05] bg-transparent border-b border-white/10 transition-colors animate-in fade-in-0 slide-in-from-top-1 duration-300">
                      <TableCell className="font-mono text-xs text-slate-400">
                        {trade.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`gap-1 text-xs font-mono font-bold ${
                            trade.isBuy
                              ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-950/50 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {trade.isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {trade.isBuy ? "BUY" : "SELL"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-serif font-bold text-white text-sm">{trade.ticker}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-white font-semibold">
                        {trade.isBuy ? `${trade.amountIn} MON` : `${trade.amountIn} shares`}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-emerald-400 font-semibold">
                        {trade.isBuy ? `${trade.amountOut} shares` : `${trade.amountOut} MON`}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-white font-semibold">
                        ${trade.newPrice}
                      </TableCell>
                      <TableCell className="text-right">
                        {trade.txHash && (
                          <a
                            href={`https://testnet.monadscan.com/tx/${trade.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5 inline" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}