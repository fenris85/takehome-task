import { defineChain } from 'viem';

export const createHyperEvmChain = (rpcUrl: string) => defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    decimals: 18,
    name: 'Hype',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: [rpcUrl],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://www.hyperscan.com/' },
  },
  blockTime: 1_000,
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 13051,
    },
  },
});

export const hyperEvm = createHyperEvmChain(process.env.RPC_URL || '');
