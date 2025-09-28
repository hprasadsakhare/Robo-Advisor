import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { StatsCard } from './StatsCard.tsx';
import { APYChart } from './APYChart.tsx';
import { Bot, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { Hero } from '../Landing/Hero.tsx';
import { Features } from '../Landing/Features.tsx';
import { NetworkStatus } from '../Common/NetworkStatus.tsx';
import { Resources } from '../Landing/Resources.tsx';

export function Dashboard() {
    const { stats, loading, error } = useDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-error-600 mb-4">
                    <Activity className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Hero Section */}
            <Hero />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-neutral-400 mt-2">
                    Monitor your robo-advisor performance and market conditions
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Agents"
                    value={stats.totalAgents}
                    subtitle="Registered robo-advisors"
                    icon={Bot}
                    color="primary"
                />
                <StatsCard
                    title="Total Executions"
                    value={stats.totalExecutions}
                    subtitle="Strategy executions"
                    icon={Activity}
                    color="success"
                />
                <StatsCard
                    title="Total Value"
                    value={`${stats.totalValue} ETH`}
                    subtitle="Under management"
                    icon={DollarSign}
                    color="warning"
                />
                <StatsCard
                    title="Current Strategy"
                    value={stats.currentAaveApy > stats.thresholdApy ? 'Aave' : 'Uniswap'}
                    subtitle={`${(stats.currentAaveApy / 100).toFixed(2)}% vs ${(stats.thresholdApy / 100).toFixed(2)}%`}
                    icon={TrendingUp}
                    color={stats.currentAaveApy > stats.thresholdApy ? 'success' : 'warning'}
                />
            </div>

            {/* Network Status and APY Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NetworkStatus />
                <APYChart
                    aaveApy={stats.currentAaveApy}
                    uniswapApy={stats.currentUniswapApy}
                    thresholdApy={stats.thresholdApy}
                />

                {/* Quick Actions */}
                <div className="card bg-surface-800/60 border border-surface-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        <button className="w-full bg-primary-600 hover:bg-primary-500 text-black font-semibold py-2.5 rounded-lg transition">
                            Register New Agent
                        </button>
                        <button className="w-full bg-surface-700 hover:bg-surface-600 text-neutral-100 font-semibold py-2.5 rounded-lg transition">
                            Execute Strategy
                        </button>
                        <button className="w-full bg-surface-700 hover:bg-surface-600 text-neutral-100 font-semibold py-2.5 rounded-lg transition">
                            View Execution History
                        </button>
                        <button className="w-full bg-surface-700 hover:bg-surface-600 text-neutral-100 font-semibold py-2.5 rounded-lg transition">
                            Manage Agents
                        </button>
                    </div>
                </div>
            </div>

            {/* Features */}
            <Features />

            {/* Recent Activity */}
            <div className="card bg-surface-800/60 border border-surface-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                <div className="text-center py-8 text-neutral-400">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity to display</p>
                    <p className="text-sm">Execute a strategy to see activity here</p>
                </div>
            </div>

            {/* Resources */}
            <Resources />
        </div>
    );
}
