import { useState, useEffect, useCallback } from 'react';
import { useIdentityRegistry, IDENTITY_REGISTRY_ABI } from './useContracts.ts';
import { useWallet } from './useWallet.ts';
import { AgentCard } from '../types';
import { keccak256, toHex } from 'viem';
import { CONTRACT_ADDRESSES } from '../config/contracts.ts';

export function useAgent(agentId?: string) {
    const identityRegistry = useIdentityRegistry();
    const { isConnected, chainId } = useWallet();
    const [agent, setAgent] = useState<AgentCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAgent = useCallback(async (id: string) => {
        if (!identityRegistry) return;

        setLoading(true);
        setError(null);

        try {
            const agentData = await identityRegistry.read.getAgentCard([id]) as AgentCard;
            if (agentData) {
                setAgent({
                    name: agentData.name,
                    strategyDescription: agentData.strategyDescription,
                    creator: agentData.creator,
                    createdAt: Number(agentData.createdAt),
                    isActive: agentData.isActive,
                });
            } else {
                setError('Invalid agent data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch agent');
        } finally {
            setLoading(false);
        }
    }, [identityRegistry]);

    useEffect(() => {
        if (agentId) {
            fetchAgent(agentId);
        }
    }, [agentId, fetchAgent]);

    const registerAgent = async (name: string, strategyDescription: string) => {
        console.log('Attempting to register agent:', { name, strategyDescription });
        console.log('Wallet connection state:', { isConnected, chainId });
        
        if (!isConnected) {
            const errorMsg = 'Wallet not connected. Please connect your wallet to register an agent.';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        if (chainId !== 31) {
            const errorMsg = 'Please switch to Rootstock Testnet (Chain ID: 31) to register an agent.';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        setLoading(true);
        setError(null);

        try {
            // Generate a unique agent ID
            const agentId = keccak256(toHex(`${name}-${Date.now()}`));
            console.log('Generated agent ID:', agentId);

            // Use wagmi's contract write pattern
            const { writeContract } = await import('wagmi/actions');
            
            console.log('Calling registerAgent with params:', [agentId, name, strategyDescription]);
            
            const txHash = await writeContract({
                address: CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
                abi: IDENTITY_REGISTRY_ABI,
                functionName: 'registerAgent',
                args: [agentId, name, strategyDescription],
            });
            
            console.log('Transaction hash:', txHash);
            
            return agentId;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to register agent';
            console.error('Error registering agent:', err);
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        agent,
        loading,
        error,
        registerAgent,
        refetch: () => agentId && fetchAgent(agentId),
    };
}
