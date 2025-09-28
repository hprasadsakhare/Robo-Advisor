import React from 'react';
import { Shield, Zap, Bot, Link as LinkIcon, Activity, Gauge } from 'lucide-react';

const FEATURES = [
    {
        title: 'Bitcoin Security via Rootstock',
        description: 'Execute smart strategies anchored by Bitcoin security through the Rootstock sidechain.',
        icon: Shield,
    },
    {
        title: 'Low Fees, Fast Finality',
        description: 'Transact on Rootstock with low fees and quick confirmations for a smooth UX.',
        icon: Zap,
    },
    {
        title: 'Autonomous Agents',
        description: 'Create and manage robo-advisors that react to on-chain APY signals automatically.',
        icon: Bot,
    },
    {
        title: 'Cross-Protocol Strategies',
        description: 'Combine multiple DeFi protocols seamlessly within one strategy pipeline.',
        icon: LinkIcon,
    },
    {
        title: 'Transparent History',
        description: 'View an auditable trail of validations and strategy executions on-chain.',
        icon: Activity,
    },
    {
        title: 'Real-time Metrics',
        description: 'Track APY thresholds and outcomes at a glance with responsive charts.',
        icon: Gauge,
    },
];

export function Features() {
    return (
        <section className="bg-surface-800/40 border border-surface-700 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Why build on Rootstock</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURES.map((f) => (
                    <div key={f.title} className="bg-surface-900/40 border border-surface-700 rounded-lg p-5">
                        <div className="flex items-center gap-3">
                            <f.icon className="w-5 h-5 text-primary-400" />
                            <h4 className="font-semibold text-white">{f.title}</h4>
                        </div>
                        <p className="text-sm text-neutral-400 mt-2">{f.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
