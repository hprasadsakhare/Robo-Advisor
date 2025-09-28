// Contract types
export interface AgentCard {
    name: string;
    strategyDescription: string;
    creator: string;
    createdAt: number;
    isActive: boolean;
}

export interface StrategyExecution {
    agentId: string;
    timestamp: number;
    aaveApy: number;
    movedToAave: boolean;
    amount: string;
    proofId: string;
}

export interface ValidationProof {
    proofHash: string;
    walrusReference: string;
    validator: string;
    submittedAt: number;
    isValid: boolean;
    agentId: string;
}

export interface StrategyConfig {
    aaveThresholdApy: number;
    aaveToken: string;
    uniswapToken: string;
    isActive: boolean;
}

// UI types
export interface DashboardStats {
    totalAgents: number;
    totalExecutions: number;
    totalValue: string;
    currentAaveApy: number;
    currentUniswapApy: number;
    thresholdApy: number;
}

export interface ExecutionHistory {
    executions: StrategyExecution[];
    totalCount: number;
}

// Form types
export interface RegisterAgentForm {
    name: string;
    strategyDescription: string;
}

export interface ExecuteStrategyForm {
    agentId: string;
    amount: string;
}

// API response types
export interface ContractResponse<T> {
    data: T;
    error?: string;
    loading: boolean;
}

// Wallet types
export interface WalletState {
    address: string | null;
    isConnected: boolean;
    chainId: number | null;
    balance: string | null;
}

// TEE types
export interface TEEProof {
    proofId: string;
    proofHash: string;
    signature: string;
    agentId: string;
    strategyResult: string;
    timestamp: number;
}

// Walrus types
export interface WalrusStorage {
    walrusId: string;
    walrusProofHash: string;
    proofData: string;
}
