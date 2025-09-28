import React from 'react';
import { useAccount, useChainId } from 'wagmi';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const ROOTSTOCK_TESTNET_CHAIN_ID = 31;

export function NetworkSwitch() {
    const { isConnected } = useAccount();
    const chainId = useChainId();

    // Don't show if wallet is not connected
    if (!isConnected) {
        return null;
    }

    // Don't show if already on Rootstock Testnet
    if (chainId === ROOTSTOCK_TESTNET_CHAIN_ID) {
        return (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Connected to Rootstock Testnet</span>
            </div>
        );
    }

    return (
        <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-orange-400 font-semibold mb-1">Wrong Network</h3>
                    <p className="text-orange-300 text-sm mb-3">
                        Please switch to Rootstock Testnet (Chain ID: 31) to use this application.
                        You can switch networks using your wallet or the network selector in the header.
                    </p>
                    <div className="text-orange-300 text-xs">
                        Current network: Chain ID {chainId}
                    </div>
                </div>
            </div>
        </div>
    );
}
