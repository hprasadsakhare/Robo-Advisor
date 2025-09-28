import React from 'react';
import { Rocket, Sparkles } from 'lucide-react';

export function Hero() {
    return (
        <section className="relative overflow-hidden rounded-2xl border border-surface-700 bg-gradient-to-br from-surface-800 via-surface-900 to-black p-8">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-primary-600/20 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-primary-500/10 blur-2xl" />
            <div className="relative">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 text-primary-300 text-xs font-semibold uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" /> On Rootstock Testnet
                        </div>
                        <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">
                            Trustless Robo-Advisor
                        </h2>
                        <p className="mt-3 text-neutral-300 max-w-2xl">
                            Automate your DeFi strategy with verifiable proofs and transparent execution, secured by the Rootstock network.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a href="#agents" className="inline-flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-black font-semibold py-2.5 px-4 rounded-lg transition">
                                <Rocket className="w-4 h-4 mr-2" /> Create Agent
                            </a>
                            <a href="#history" className="inline-flex items-center justify-center bg-surface-800 hover:bg-surface-700 text-neutral-100 font-semibold py-2.5 px-4 rounded-lg transition">
                                View History
                            </a>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        <div className="rounded-xl border border-surface-700 bg-surface-900/60 p-4 min-w-[260px]">
                            <div className="text-xs text-neutral-400">Current Network</div>
                            <div className="text-lg font-semibold text-white">Rootstock (Testnet)</div>
                            <div className="mt-2 text-xs text-neutral-400">Currency</div>
                            <div className="text-sm text-white">tRBTC</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
