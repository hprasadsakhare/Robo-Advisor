import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '../../hooks/useWallet';
import { Wallet, Bot, TrendingUp } from 'lucide-react';

export function Header() {
    const { isConnected, address, balance, chainId } = useWallet();
    const symbol = chainId === 30 ? 'RBTC' : chainId === 31 ? 'tRBTC' : 'ETH';

    return (
        <header className="bg-surface-900/95 backdrop-blur border-b border-surface-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg shadow shadow-primary-600/30">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Robo-Advisor</h1>
                            <p className="text-sm text-neutral-400">Trustless Investment Strategy</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#dashboard" className="flex items-center space-x-2 text-neutral-300 hover:text-primary-400 transition-colors">
                            <TrendingUp className="w-4 h-4" />
                            <span>Dashboard</span>
                        </a>
                        <a href="#agents" className="text-neutral-300 hover:text-primary-400 transition-colors">
                            Agents
                        </a>
                        <a href="#strategy" className="text-neutral-300 hover:text-primary-400 transition-colors">
                            Strategy
                        </a>
                        <a href="#history" className="text-neutral-300 hover:text-primary-400 transition-colors">
                            History
                        </a>
                    </nav>

                    {/* Wallet Connection */}
                    <div className="flex items-center space-x-4">
                        {isConnected && (
                            <div className="hidden sm:flex items-center space-x-3 text-sm">
                                <div className="flex items-center space-x-2 text-neutral-300">
                                    <Wallet className="w-4 h-4" />
                                    <span className="font-mono">
                                        {address?.slice(0, 6)}...{address?.slice(-4)}
                                    </span>
                                </div>
                                {balance && (
                                    <div className="text-neutral-400">
                                        {parseFloat(balance).toFixed(4)} {symbol}
                                    </div>
                                )}
                            </div>
                        )}
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </header>
    );
}
