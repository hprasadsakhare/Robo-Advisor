import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, parseAbi, createPublicClient, http } from 'viem';
import { CONTRACT_ADDRESSES } from '../config/contracts';

// Contract ABIs (simplified - in production, import from compiled artifacts)
export const IDENTITY_REGISTRY_ABI = [
    {
        name: 'registerAgent',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'agentId', type: 'bytes32' },
            { name: 'name', type: 'string' },
            { name: 'strategyDescription', type: 'string' }
        ],
        outputs: []
    },
    {
        name: 'getAgentCard',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'agentId', type: 'bytes32' }],
        outputs: [
            {
                type: 'tuple',
                components: [
                    { name: 'name', type: 'string' },
                    { name: 'strategyDescription', type: 'string' },
                    { name: 'creator', type: 'address' },
                    { name: 'createdAt', type: 'uint256' },
                    { name: 'isActive', type: 'bool' }
                ]
            }
        ]
    },
    {
        name: 'getAgentsByCreator',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'creator', type: 'address' }],
        outputs: [{ type: 'bytes32[]' }]
    },
    {
        name: 'getTotalAgents',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }]
    },
    {
        name: 'getAgentIdByIndex',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'index', type: 'uint256' }],
        outputs: [{ type: 'bytes32' }]
    },
    {
        name: 'isAgentActive',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'agentId', type: 'bytes32' }],
        outputs: [{ type: 'bool' }]
    },
    {
        name: 'AgentRegistered',
        type: 'event',
        inputs: [
            { name: 'agentId', type: 'bytes32', indexed: true },
            { name: 'name', type: 'string' },
            { name: 'strategyDescription', type: 'string' },
            { name: 'creator', type: 'address', indexed: true }
        ]
    }
] as const;

const VALIDATION_REGISTRY_ABI = [
    {
        name: 'submitProof',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'proofId', type: 'bytes32' },
            { name: 'agentId', type: 'bytes32' },
            { name: 'proofHash', type: 'bytes32' },
            { name: 'walrusReference', type: 'string' },
            { name: 'signature', type: 'bytes' },
        ],
        outputs: [],
    },
    {
        name: 'getValidationProof',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'proofId', type: 'bytes32' }],
        outputs: [
            {
                type: 'tuple',
                components: [
                    { name: 'proofHash', type: 'bytes32' },
                    { name: 'walrusReference', type: 'string' },
                    { name: 'validator', type: 'address' },
                    { name: 'submittedAt', type: 'uint256' },
                    { name: 'isValid', type: 'bool' },
                    { name: 'agentId', type: 'bytes32' },
                ],
            },
        ],
    },
    {
        name: 'getProofsByAgent',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'agentId', type: 'bytes32' }],
        outputs: [{ type: 'bytes32[]' }],
    },
    {
        name: 'getTotalProofs',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
    },
    {
        name: 'isProofValid',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'proofId', type: 'bytes32' }],
        outputs: [{ type: 'bool' }],
    },
    {
        name: 'getLatestValidProof',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'agentId', type: 'bytes32' }],
        outputs: [{ type: 'bytes32' }],
    },
    {
        name: 'generateMockProofHash',
        type: 'function',
        stateMutability: 'pure',
        inputs: [
            { name: 'agentId', type: 'bytes32' },
            { name: 'strategyResult', type: 'string' },
            { name: 'timestamp', type: 'uint256' },
        ],
        outputs: [{ type: 'bytes32' }],
    },
    {
        name: 'ProofSubmitted',
        type: 'event',
        inputs: [
            { name: 'proofId', type: 'bytes32', indexed: true },
            { name: 'agentId', type: 'bytes32', indexed: true },
            { name: 'proofHash', type: 'bytes32' },
            { name: 'walrusReference', type: 'string' },
            { name: 'validator', type: 'address', indexed: true },
        ],
    },
] as const;

const ROBO_ADVISOR_ABI = [
    {
        name: 'executeStrategy',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
            { name: 'agentId', type: 'bytes32' },
            { name: 'amount', type: 'uint256' },
            { name: 'proofId', type: 'bytes32' },
        ],
        outputs: [],
    },
    {
        name: 'getAgentExecutions',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'agentId', type: 'bytes32' }],
        outputs: [
            {
                type: 'tuple[]',
                components: [
                    { name: 'agentId', type: 'bytes32' },
                    { name: 'timestamp', type: 'uint256' },
                    { name: 'aaveApy', type: 'uint256' },
                    { name: 'movedToAave', type: 'bool' },
                    { name: 'amount', type: 'uint256' },
                    { name: 'proofId', type: 'bytes32' },
                ],
            },
        ],
    },
    {
        name: 'getTotalExecutions',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
    },
    {
        name: 'getExecutionByIndex',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'index', type: 'uint256' }],
        outputs: [
            {
                type: 'tuple',
                components: [
                    { name: 'agentId', type: 'bytes32' },
                    { name: 'timestamp', type: 'uint256' },
                    { name: 'aaveApy', type: 'uint256' },
                    { name: 'movedToAave', type: 'bool' },
                    { name: 'amount', type: 'uint256' },
                    { name: 'proofId', type: 'bytes32' },
                ],
            },
        ],
    },
    {
        name: 'getLatestExecution',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'agentId', type: 'bytes32' }],
        outputs: [
            {
                type: 'tuple',
                components: [
                    { name: 'agentId', type: 'bytes32' },
                    { name: 'timestamp', type: 'uint256' },
                    { name: 'aaveApy', type: 'uint256' },
                    { name: 'movedToAave', type: 'bool' },
                    { name: 'amount', type: 'uint256' },
                    { name: 'proofId', type: 'bytes32' },
                ],
            },
        ],
    },
    {
        name: 'getCurrentStrategyDecision',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'bool' }],
    },
    {
        name: 'getCurrentApyInfo',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                name: 'aaveApy',
                type: 'uint256',
            },
            {
                name: 'uniswapApy',
                type: 'uint256',
            },
            {
                name: 'thresholdApy',
                type: 'uint256',
            },
        ],
    },
    {
        name: 'strategyConfig',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [
            {
                type: 'tuple',
                components: [
                    { name: 'aaveThresholdApy', type: 'uint256' },
                    { name: 'aaveToken', type: 'address' },
                    { name: 'uniswapToken', type: 'address' },
                    { name: 'isActive', type: 'bool' },
                ],
            },
        ],
    },
    {
        name: 'mockAaveApy',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
    },
    {
        name: 'mockUniswapApy',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
    },
] as const;

const TEE_SIMULATION_ABI = [
    'function generateProof(bytes32 agentId, string strategyResult, bytes transactionData) external returns (bytes32 proofId, bytes32 proofHash, bytes signature)',
    'function verifyProof(bytes32 proofId, bytes32 proofHash, bytes signature) external view returns (bool)',
] as const;

const WALRUS_INTEGRATION_ABI = [
    'function storeProof(bytes proofData, bytes32 agentId) external returns (string walrusId, bytes32 walrusProofHash)',
    'function retrieveProof(string walrusId) external view returns (bytes)',
] as const;

export function useIdentityRegistry() {
    const publicClient = usePublicClient();
    const { data: walletClient, isLoading: walletLoading } = useWalletClient();
    
    // Debug logging for wallet connection
    if (!walletClient && !walletLoading) {
        console.log('Wallet not connected - contract will only support read operations');
    }
    
    // Ensure we always have a public client for read operations
    const fallbackRpc = process.env.REACT_APP_RPC_URL || 'https://public-node.testnet.rsk.co';
    const effectivePublicClient = publicClient ?? createPublicClient({ transport: http(fallbackRpc) });

    try {
        const contract = getContract({
            address: CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
            abi: IDENTITY_REGISTRY_ABI,
            publicClient: effectivePublicClient,
            walletClient: walletClient ?? undefined,
        }) as any;
        
        console.log('IdentityRegistry contract initialized successfully');
        
        return contract;
    } catch (error) {
        console.error('Failed to initialize IdentityRegistry contract:', error);
        return null;
    }
}

export function useValidationRegistry() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const fallbackRpc = process.env.REACT_APP_RPC_URL || 'https://public-node.testnet.rsk.co';
    const effectivePublicClient = publicClient ?? createPublicClient({ transport: http(fallbackRpc) });
    return getContract({
        address: CONTRACT_ADDRESSES.VALIDATION_REGISTRY,
        abi: VALIDATION_REGISTRY_ABI,
        publicClient: effectivePublicClient,
        walletClient: walletClient ?? undefined,
    }) as any;
}

export function useRoboAdvisor() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const fallbackRpc = process.env.REACT_APP_RPC_URL || 'https://public-node.testnet.rsk.co';
    const effectivePublicClient = publicClient ?? createPublicClient({ transport: http(fallbackRpc) });
    return getContract({
        address: CONTRACT_ADDRESSES.ROBO_ADVISOR,
        abi: ROBO_ADVISOR_ABI,
        publicClient: effectivePublicClient,
        walletClient: walletClient ?? undefined,
    }) as any;
}

export function useTEESimulation() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const fallbackRpc = process.env.REACT_APP_RPC_URL || 'https://public-node.testnet.rsk.co';
    const effectivePublicClient = publicClient ?? createPublicClient({ transport: http(fallbackRpc) });
    return getContract({
        address: CONTRACT_ADDRESSES.TEE_SIMULATION,
        abi: parseAbi(TEE_SIMULATION_ABI),
        publicClient: effectivePublicClient,
        walletClient: walletClient ?? undefined,
    }) as any;
}

export function useWalrusIntegration() {
    const publicClient = usePublicClient();
    const { data: walletClient } = useWalletClient();
    const fallbackRpc = process.env.REACT_APP_RPC_URL || 'https://public-node.testnet.rsk.co';
    const effectivePublicClient = publicClient ?? createPublicClient({ transport: http(fallbackRpc) });
    return getContract({
        address: CONTRACT_ADDRESSES.WALRUS_INTEGRATION,
        abi: parseAbi(WALRUS_INTEGRATION_ABI),
        publicClient: effectivePublicClient,
        walletClient: walletClient ?? undefined,
    }) as any;
}
