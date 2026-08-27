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
      args: [stock.id],
      query: { refetchInterval: 5000 },
    })
    return { stock, price }
  })

  const totalValue = holdings.reduce((acc, h) => {
    if (!h.price) return acc
    return acc + Number(h.price) / 1e18 * 0 // We don't have share balance easily without tracking events
  }, Number(cashBalance || 0) / 1e18)

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
        <CardTitle>Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-2xl font-bold">
            Total Value: {totalValue.toFixed(2)} SUSD
          </div>
          <div className="text-muted-foreground">
            Cash: {cashBalance ? formatUnits(cashBalance) : "Loading..."} SUSD
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map(({ stock, price }) => (
              <TableRow key={stock.id}>
                <TableCell className="font-medium">{stock.ticker}</TableCell>
                <TableCell className="text-right font-mono">
                  {price ? formatPrice(price) : "Loading..."} SUSD
                </TableCell>
                <TableCell className="text-right font-mono">0.0000</TableCell>
                <TableCell className="text-right font-mono font-medium">0.00 SUSD</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className="text-sm text-muted-foreground mt-4">
          Share balances require event indexing. For demo, shows price data only.
        </p>
      </CardContent>
    </Card>
  )
}