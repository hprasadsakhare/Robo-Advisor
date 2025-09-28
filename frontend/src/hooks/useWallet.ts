import { useAccount, useBalance, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { WalletState } from '../types';

export function useWallet(): WalletState {
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { data: balance } = useBalance({
        address: address,
    });

    return {
        address: address || null,
        isConnected,
        chainId: chainId || null,
        balance: balance ? formatEther(balance.value) : null,
    };
}
