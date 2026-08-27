"use client"

import { useAccount, useReadContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { PLAY_MONEY_ADDRESS, playMoneyAbi, STOCK_AMM_ADDRESS, stockAmmAbi, STOCKS } from "@/lib/contracts/contracts"

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
      query: { refetchInterval: 5000 },
    })
    return { stock, stockData }
  })

  const cashNum = cashBalance ? Number(cashBalance) / 1e18 : 0

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Connect wallet to view portfolio</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 bg-muted/40 p-4 rounded-lg">
          <div className="text-3xl font-extrabold tracking-tight">
            ${cashNum.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">SUSD Cash Balance</span>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticker</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">24h Anchor Base</TableHead>
              <TableHead className="text-right">Current Bonding Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map(({ stock, stockData }) => {
              const tickerStr = stockData?.[0] || stock.ticker
              const nameStr = stockData?.[1] || stock.name
              const basePrice = stockData?.[4] ? Number(stockData[4]) / 1e18 : 0
              const currentPrice = stockData?.[6] ? Number(stockData[6]) / 1e18 : 0

              return (
                <TableRow key={stock.id}>
                  <TableCell className="font-bold">{tickerStr}</TableCell>
                  <TableCell className="text-muted-foreground">{nameStr}</TableCell>
                  <TableCell className="text-right font-mono">
                    {basePrice > 0 ? `$${basePrice.toFixed(2)}` : "Loading..."}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {currentPrice > 0 ? `$${currentPrice.toFixed(2)} SUSD` : "Loading..."}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}