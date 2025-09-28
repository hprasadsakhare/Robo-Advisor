import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from './config/wagmi.ts';
import { Layout } from './components/Layout/Layout.tsx';
import { Dashboard } from './components/Dashboard/Dashboard.tsx';
import { AgentsList } from './components/Agents/AgentsList.tsx';
import { ExecutionHistory } from './components/History/ExecutionHistory.tsx';
import { ExecuteStrategyModal } from './components/Strategy/ExecuteStrategyModal.tsx';
import '@rainbow-me/rainbowkit/styles.css';

// Create a client
const queryClient = new QueryClient();

type Tab = 'dashboard' | 'agents' | 'history';

function App() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [executeModalOpen, setExecuteModalOpen] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<{ id: string; name: string } | null>(null);

    const handleExecuteStrategy = (agentId: string, agentName: string) => {
        setSelectedAgent({ id: agentId, name: agentName });
        setExecuteModalOpen(true);
    };

    const handleCloseExecuteModal = () => {
        setExecuteModalOpen(false);
        setSelectedAgent(null);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'agents':
                return <AgentsList onExecuteStrategy={handleExecuteStrategy} />;
            case 'history':
                return <ExecutionHistory />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <WagmiConfig config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider chains={chains}>
                    <Layout>
                        <div className="space-y-8">
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('dashboard')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                                                ? 'border-primary-500 text-primary-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('agents')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'agents'
                                                ? 'border-primary-500 text-primary-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        Agents
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                                                ? 'border-primary-500 text-primary-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        History
                                    </button>
                                </nav>
                            </div>

                            {/* Content */}
                            {renderContent()}
                        </div>

                        {/* Execute Strategy Modal */}
                        {selectedAgent && (
                            <ExecuteStrategyModal
                                isOpen={executeModalOpen}
                                onClose={handleCloseExecuteModal}
                                agentId={selectedAgent.id}
                                agentName={selectedAgent.name}
                            />
                        )}
                    </Layout>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiConfig>
    );
}

export default App;
