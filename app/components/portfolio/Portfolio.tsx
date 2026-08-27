"use client"

import { useAccount, useReadContract } from "wagmi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { formatUnits, formatPrice } from "@/lib/utils"
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
    const { data: price } = useReadContract({
      address: STOCK_AMM_ADDRESS,
      abi: stockAmmAbi,
      functionName: "getPrice",
      args: [BigInt(stock.id)],
      query: { refetchInterval: 5000 },
    })
    return { stock, price }
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
            {holdings.map(({ stock, price }) => {
              const priceNum = price ? Number(price) / 1e18 : stock.defaultBasePrice
              return (
                <TableRow key={stock.id}>
                  <TableCell className="font-bold">{stock.ticker}</TableCell>
                  <TableCell className="text-muted-foreground">{stock.name}</TableCell>
                  <TableCell className="text-right font-mono">${stock.defaultBasePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono font-bold">${priceNum.toFixed(2)} SUSD</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}