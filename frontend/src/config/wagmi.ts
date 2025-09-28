import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import type { Chain } from 'viem';
// Network configuration is used in contracts.ts

// Rootstock (RSK) custom chains
const rskMainnet: Chain = {
    id: 30,
    name: 'Rootstock Mainnet',
    network: 'rootstock',
    nativeCurrency: { name: 'Rootstock Bitcoin', symbol: 'RBTC', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://public-node.rsk.co'] },
        public: { http: ['https://public-node.rsk.co'] },
    },
    blockExplorers: {
        default: { name: 'RSK Explorer', url: 'https://explorer.rsk.co' },
    },
    testnet: false,
};

const rskTestnet: Chain = {
    id: 31,
    name: 'Rootstock Testnet',
    network: 'rootstock-testnet',
    nativeCurrency: { name: 'Test RBTC', symbol: 'tRBTC', decimals: 18 },
    rpcUrls: {
        default: {
            http: [
                // Prefer env var if provided; fallback to public Rootstock testnet RPC
                process.env.REACT_APP_RPC_URL || 'https://public-node.testnet.rsk.co',
            ],
        },
        public: {
            http: [
                process.env.REACT_APP_RPC_URL || 'https://public-node.testnet.rsk.co',
            ],
        },
    },
    blockExplorers: {
        default: { name: 'RSK Testnet Explorer', url: 'https://explorer.testnet.rsk.co' },
    },
    testnet: true,
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [rskTestnet, rskMainnet], // Only include Rootstock networks
    [
        // Use JSON-RPC provider for Rootstock networks
        jsonRpcProvider({
            rpc: (chain) => {
                const url = chain.rpcUrls?.default?.http?.[0];
                return url ? { http: url } : null;
            },
        }),
        // Fallback public provider
        publicProvider(),
    ]
);

const { connectors } = getDefaultWallets({
    appName: 'Robo-Advisor dApp',
    projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || '',
    chains,
});

export const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

export { chains };
