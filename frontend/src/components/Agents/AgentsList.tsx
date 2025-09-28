import React, { useState, useEffect, useCallback } from 'react';
import { useIdentityRegistry } from '../../hooks/useContracts.ts';
import { AgentCard } from './AgentCard.tsx';
import { RegisterAgentModal } from './RegisterAgentModal.tsx';
import { NetworkSwitch } from '../Common/NetworkSwitch.tsx';
import { Plus, Search, Bot } from 'lucide-react';
import { AgentCard as AgentCardType } from '../../types';

interface AgentsListProps {
    onExecuteStrategy?: (agentId: string, agentName: string) => void;
}

export function AgentsList({ onExecuteStrategy }: AgentsListProps) {
    const identityRegistry = useIdentityRegistry();
    const [agents, setAgents] = useState<{ id: string; data: AgentCardType }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const fetchAgents = useCallback(async () => {
        if (!identityRegistry) return;

        setLoading(true);
        setError(null);

        try {
            const totalAgents = await identityRegistry.read.getTotalAgents([]);
            const agentPromises: { id: string; data: AgentCardType }[] = [];

            for (let i = 0; i < Number(totalAgents); i++) {
                const agentId = await identityRegistry.read.getAgentIdByIndex([BigInt(i)]);
                const agentData = await identityRegistry.read.getAgentCard([agentId]) as any;
                agentPromises.push({
                    id: agentId,
                    data: {
                        name: agentData.name,
                        strategyDescription: agentData.strategyDescription,
                        creator: agentData.creator,
                        createdAt: Number(agentData.createdAt),
                        isActive: agentData.isActive,
                    }
                });
            }

            const allAgents = await Promise.all(agentPromises);
            setAgents(allAgents);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch agents');
        } finally {
            setLoading(false);
        }
    }, [identityRegistry]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    // Optional static sample agents when list is empty
    const staticMode = process.env.REACT_APP_STATIC_SAMPLE === '1';
    const baseAgents = (() => {
        if (staticMode && agents.length === 0) {
            return [
                {
                    id: '0x1111111111111111111111111111111111111111111111111111111111111111',
                    data: {
                        name: 'Conservative Growth Bot',
                        strategyDescription: 'Move to Aave when APY > 5%, otherwise provide Uniswap liquidity.',
                        creator: '0x1234567890abcdef1234567890abcdef12345678',
                        createdAt: Math.floor(Date.now() / 1000) - 86400,
                        isActive: true,
                    },
                },
                {
                    id: '0x2222222222222222222222222222222222222222222222222222222222222222',
                    data: {
                        name: 'Yield Chaser',
                        strategyDescription: 'Dynamically rebalance based on weekly APY snapshots.',
                        creator: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                        createdAt: Math.floor(Date.now() / 1000) - 172800,
                        isActive: false,
                    },
                },
            ];
        }
        return agents;
    })();

    const filteredAgents = baseAgents.filter(agent =>
        agent.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.data.strategyDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExecuteStrategy = (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        if (agent && onExecuteStrategy) {
            onExecuteStrategy(agentId, agent.data.name);
        }
    };

    const handleViewDetails = (agentId: string) => {
        // Navigate to agent details page
        console.log('View details for agent:', agentId);
    };

    const handleRegisterSuccess = (agentId: string) => {
        fetchAgents(); // Refresh the list
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Network Switch Warning */}
            <NetworkSwitch />
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your robo-advisor agents and strategies
                    </p>
                </div>
                <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="btn btn-primary mt-4 sm:mt-0"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Register Agent
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Bot className="w-5 h-5 text-error-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-error-800">Error Loading Agents</h3>
                            <p className="text-sm text-error-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Agents Grid */}
            {filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents.map((agent) => (
                        <AgentCard
                            key={agent.id}
                            agent={agent.data}
                            agentId={agent.id}
                            onExecute={handleExecuteStrategy}
                            onView={handleViewDetails}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No agents found' : 'No agents registered'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm
                            ? 'Try adjusting your search terms'
                            : 'Get started by registering your first robo-advisor agent'
                        }
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="btn btn-primary"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Register Your First Agent
                        </button>
                    )}
                </div>
            )}

            {/* Register Agent Modal */}
            <RegisterAgentModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={handleRegisterSuccess}
            />
        </div>
    );
}
