import React, { useEffect } from 'react';
import { useStrategy } from '../../hooks/useStrategy';
import { useAgent } from '../../hooks/useAgent';
import { Activity, TrendingUp, TrendingDown, Clock, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface ExecutionHistoryProps {
    agentId?: string;
}

export function ExecutionHistory({ agentId }: ExecutionHistoryProps) {
    const { executions, loading, error, fetchExecutions } = useStrategy();
    const { agent } = useAgent(agentId);

    useEffect(() => {
        if (agentId) {
            fetchExecutions(agentId);
        }
    }, [agentId, fetchExecutions]);

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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading History</h3>
                <p className="text-gray-500">{error}</p>
            </div>
        );
    }

    if (executions.length === 0) {
        return (
            <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Execution History</h3>
                <p className="text-gray-500">
                    {agentId ? 'This agent has not executed any strategies yet.' : 'No strategy executions found.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Execution History</h1>
                <p className="text-gray-600 mt-2">
                    {agent ? `Strategy executions for ${agent.name}` : 'All strategy executions'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Executions</p>
                            <p className="text-2xl font-bold text-gray-900">{executions.length}</p>
                        </div>
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <Activity className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Aave Executions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {executions.filter(e => e.movedToAave).length}
                            </p>
                        </div>
                        <div className="p-3 bg-success-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-success-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Uniswap Executions</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {executions.filter(e => !e.movedToAave).length}
                            </p>
                        </div>
                        <div className="p-3 bg-warning-50 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-warning-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Execution List */}
            <div className="space-y-4">
                {executions.map((execution, index) => (
                    <div key={index} className="card">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-lg ${execution.movedToAave ? 'bg-success-50' : 'bg-warning-50'
                                    }`}>
                                    {execution.movedToAave ? (
                                        <TrendingUp className={`w-6 h-6 ${execution.movedToAave ? 'text-success-600' : 'text-warning-600'
                                            }`} />
                                    ) : (
                                        <TrendingDown className="w-6 h-6 text-warning-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {execution.movedToAave ? 'Moved to Aave' : 'Moved to Uniswap'}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                        <div className="flex items-center space-x-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{format(new Date(execution.timestamp * 1000), 'MMM dd, yyyy HH:mm')}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Shield className="w-4 h-4" />
                                            <span className="font-mono">{execution.proofId.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900">
                                    {(parseFloat(execution.amount) / 1e18).toFixed(4)} ETH
                                </p>
                                <p className="text-sm text-gray-500">
                                    APY: {(execution.aaveApy / 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
