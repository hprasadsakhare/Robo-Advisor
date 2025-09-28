import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Link as LinkIcon, Globe, Activity } from 'lucide-react';

const CHAIN_INFO: Record<number, { name: string; explorer: string; currency: string }> = {
    1: { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io', currency: 'ETH' },
    11155111: { name: 'Sepolia', explorer: 'https://sepolia.etherscan.io', currency: 'ETH' },
    30: { name: 'Rootstock Mainnet', explorer: 'https://explorer.rsk.co', currency: 'RBTC' },
    31: { name: 'Rootstock Testnet', explorer: 'https://explorer.testnet.rsk.co', currency: 'tRBTC' },
};

export function NetworkStatus() {
    const chainId = useChainId();
    const { isConnected, address } = useAccount();
    const info = CHAIN_INFO[chainId ?? -1];

    return (
        <div className="bg-surface-800/60 border border-surface-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Network Status</h3>
                    <p className="text-sm text-neutral-400">Current chain and account information</p>
                </div>
                <Activity className="w-5 h-5 text-primary-400" />
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                    <div className="text-neutral-400">Network</div>
                    <div className="text-white">{info ? info.name : `Chain ${chainId ?? 'N/A'}`}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-neutral-400">Currency</div>
                    <div className="text-white">{info ? info.currency : '-'}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-neutral-400">Status</div>
                    <div className="text-white">{isConnected ? 'Connected' : 'Disconnected'}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-neutral-400">Account</div>
                    <div className="text-white font-mono truncate">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '-'}</div>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs">
                {info && (
                    <a
                        href={info.explorer}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300"
                    >
                        <Globe className="w-4 h-4" /> Open Block Explorer
                    </a>
                )}
                <button
                    type="button"
                    className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-300"
                    onClick={(e) => e.preventDefault()}
                >
                    <LinkIcon className="w-4 h-4" /> RPC: Auto
                </button>
            </div>
        </div>
    );
}
