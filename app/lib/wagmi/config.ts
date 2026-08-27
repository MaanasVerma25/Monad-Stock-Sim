import { createConfig, http, injected } from 'wagmi'
import { defineChain } from 'viem'

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
    public: { http: ['https://testnet-rpc.monad.xyz'] }
  }
})

export const wagmiClient = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected()
  ],
  transports: {
    [monadTestnet.id]: http()
  }
})