import { useState, useEffect, useCallback } from 'react';
import { useRoboAdvisor, useIdentityRegistry } from './useContracts.ts';
import { DashboardStats } from '../types';

export function useDashboard() {
    const roboAdvisor = useRoboAdvisor();
    const identityRegistry = useIdentityRegistry();

    const [stats, setStats] = useState<DashboardStats>({
        totalAgents: 0,
        totalExecutions: 0,
        totalValue: '0',
        currentAaveApy: 0,
        currentUniswapApy: 0,
        thresholdApy: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardStats = useCallback(async () => {
        if (!roboAdvisor || !identityRegistry) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch all stats concurrently, allowing individual failures
            const results = await Promise.allSettled([
                identityRegistry.read.getTotalAgents([]),
                roboAdvisor.read.getTotalExecutions([]),
                roboAdvisor.read.getCurrentApyInfo([]),
                roboAdvisor.read.mockAaveApy([]),
                roboAdvisor.read.mockUniswapApy([]),
            ]);

            const getValue = <T,>(idx: number, fallback: T): T => {
                const r = results[idx];
                if (r.status === 'fulfilled') return r.value as T;
                return fallback;
            };

            const totalAgents = getValue<number>(0, 0);
            const totalExecutions = getValue<number>(1, 0);
            const apyInfo = getValue<{ aaveApy: number; uniswapApy: number; thresholdApy: number }>(2, { aaveApy: 0, uniswapApy: 0, thresholdApy: 0 });
            const mockAaveApy = getValue<number>(3, 0);
            const mockUniswapApy = getValue<number>(4, 0);

            const apy = apyInfo as { aaveApy: number; uniswapApy: number; thresholdApy: number };

            let nextStats: DashboardStats = {
                totalAgents: Number(totalAgents ?? 0),
                totalExecutions: Number(totalExecutions ?? 0),
                totalValue: '0',
                currentAaveApy: Number(apy?.aaveApy ?? mockAaveApy ?? 0),
                currentUniswapApy: Number(apy?.uniswapApy ?? mockUniswapApy ?? 0),
                thresholdApy: Number(apy?.thresholdApy ?? 0),
            };

            // Optional static sample mode
            const staticMode = process.env.REACT_APP_STATIC_SAMPLE === '1';
            const looksEmpty =
                nextStats.totalAgents === 0 &&
                nextStats.totalExecutions === 0 &&
                nextStats.currentAaveApy === 0 &&
                nextStats.currentUniswapApy === 0 &&
                nextStats.thresholdApy === 0;
            if (staticMode && looksEmpty) {
                nextStats = {
                    totalAgents: 2,
                    totalExecutions: 5,
                    totalValue: '10',
                    currentAaveApy: 650, // 6.5%
                    currentUniswapApy: 420, // 4.2%
                    thresholdApy: 500, // 5%
                };
            }

            setStats(nextStats);

            // Aggregate errors for visibility without breaking UI
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                setError('Some metrics failed to load; showing defaults.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    }, [roboAdvisor, identityRegistry]);

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    return {
        stats,
        loading,
        error,
        refetch: fetchDashboardStats,
    };
}
