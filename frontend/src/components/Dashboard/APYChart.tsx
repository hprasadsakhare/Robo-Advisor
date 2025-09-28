import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface APYChartProps {
    aaveApy: number;
    uniswapApy: number;
    thresholdApy: number;
}

export function APYChart({ aaveApy, uniswapApy, thresholdApy }: APYChartProps) {
    const maxApy = Math.max(aaveApy, uniswapApy, thresholdApy);
    const aavePercentage = (aaveApy / maxApy) * 100;
    const uniswapPercentage = (uniswapApy / maxApy) * 100;
    const thresholdPercentage = (thresholdApy / maxApy) * 100;

    const shouldMoveToAave = aaveApy > thresholdApy;

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Current APY Comparison</h3>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${shouldMoveToAave
                        ? 'bg-success-100 text-success-800'
                        : 'bg-warning-100 text-warning-800'
                    }`}>
                    {shouldMoveToAave ? (
                        <TrendingUp className="w-4 h-4" />
                    ) : (
                        <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{shouldMoveToAave ? 'Move to Aave' : 'Move to Uniswap'}</span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Aave APY */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Aave</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {(aaveApy / 100).toFixed(2)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${aavePercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Uniswap APY */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Uniswap</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {(uniswapApy / 100).toFixed(2)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-secondary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${uniswapPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Threshold Line */}
                <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Threshold</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {(thresholdApy / 100).toFixed(2)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-warning-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${thresholdPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                    <strong>Strategy:</strong> {shouldMoveToAave
                        ? `Move funds to Aave (${(aaveApy / 100).toFixed(2)}% APY > ${(thresholdApy / 100).toFixed(2)}% threshold)`
                        : `Move funds to Uniswap (${(aaveApy / 100).toFixed(2)}% APY ≤ ${(thresholdApy / 100).toFixed(2)}% threshold)`
                    }
                </p>
            </div>
        </div>
    );
}
