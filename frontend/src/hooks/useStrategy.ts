import { useState } from 'react';
import { useRoboAdvisor, useTEESimulation, useWalrusIntegration, useValidationRegistry } from './useContracts.ts';
import { StrategyExecution, TEEProof, WalrusStorage } from '../types';
import { toHex } from 'viem';

export function useStrategy() {
    const roboAdvisor = useRoboAdvisor();
    const teeSimulation = useTEESimulation();
    const walrusIntegration = useWalrusIntegration();
    const validationRegistry = useValidationRegistry();

    const [executions, setExecutions] = useState<StrategyExecution[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExecutions = async (agentId: string) => {
        if (!roboAdvisor) return;

        setLoading(true);
        setError(null);

        try {
            const executionData = await roboAdvisor.read.getAgentExecutions([agentId]) as any[];
            setExecutions(executionData.map((exec: any) => ({
                agentId: exec.agentId,
                timestamp: Number(exec.timestamp),
                aaveApy: Number(exec.aaveApy),
                movedToAave: exec.movedToAave,
                amount: exec.amount.toString(),
                proofId: exec.proofId,
            })));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch executions');
        } finally {
            setLoading(false);
        }
    };

    const generateTEEProof = async (agentId: string, strategyResult: string): Promise<TEEProof> => {
        if (!teeSimulation) throw new Error('TEE Simulation contract not available');

        const transactionData = toHex(`strategy-execution-${Date.now()}`);
        const result = await teeSimulation.write.generateProof([agentId, strategyResult, transactionData]) as any;

        return {
            proofId: result.proofId,
            proofHash: result.proofHash,
            signature: result.signature,
            agentId,
            strategyResult,
            timestamp: Date.now(),
        };
    };

    const storeInWalrus = async (proofData: string, agentId: string): Promise<WalrusStorage> => {
        if (!walrusIntegration) throw new Error('Walrus Integration contract not available');

        const result = await walrusIntegration.write.storeProof([proofData, agentId]) as any;

        return {
            walrusId: result.walrusId,
            walrusProofHash: result.walrusProofHash,
            proofData,
        };
    };

    const submitProof = async (proofId: string, agentId: string, proofHash: string, walrusReference: string, signature: string) => {
        if (!validationRegistry) throw new Error('Validation Registry contract not available');

    await validationRegistry.write.submitProof([proofId, agentId, proofHash, walrusReference, signature]);
    // Optionally, wait for confirmation using publicClient.waitForTransactionReceipt
    };

    const executeStrategy = async (agentId: string, amount: string, proofId: string) => {
        if (!roboAdvisor) throw new Error('Robo Advisor contract not available');

        setLoading(true);
        setError(null);

    try {
            await roboAdvisor.write.executeStrategy([agentId, BigInt(amount), proofId]);
            // Optionally, wait for confirmation using publicClient.waitForTransactionReceipt

            // Refresh executions after successful execution
            await fetchExecutions(agentId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to execute strategy';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const executeFullStrategy = async (agentId: string, amount: string, strategyResult: string) => {
        try {
            // 1. Generate TEE proof
            const teeProof = await generateTEEProof(agentId, strategyResult);

            // 2. Store proof data in Walrus
            const proofData = JSON.stringify({
                proofId: teeProof.proofId,
                proofHash: teeProof.proofHash,
                agentId: teeProof.agentId,
                strategyResult: teeProof.strategyResult,
                signature: teeProof.signature,
                timestamp: teeProof.timestamp,
            });

            const walrusStorage = await storeInWalrus(proofData, agentId);

            // 3. Submit proof to validation registry
            await submitProof(
                teeProof.proofId,
                agentId,
                walrusStorage.walrusProofHash,
                walrusStorage.walrusId,
                teeProof.signature
            );

            // 4. Execute strategy
            await executeStrategy(agentId, amount, teeProof.proofId);

            return {
                teeProof,
                walrusStorage,
                executionSuccess: true,
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to execute full strategy';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    return {
        executions,
        loading,
        error,
        fetchExecutions,
        executeStrategy,
        executeFullStrategy,
        generateTEEProof,
        storeInWalrus,
        submitProof,
    };
}
