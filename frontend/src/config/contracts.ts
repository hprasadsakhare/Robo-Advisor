// Contract addresses and ABIs
export const CONTRACT_ADDRESSES = {
    // Deployed on Rootstock Testnet (chainId 31)
    IDENTITY_REGISTRY: '0x4f0a7782B9fCa96ef315B3aF4f5c94772cA4F2E4',
    VALIDATION_REGISTRY: '0x16e8261b310C0eFB2f3844eeA9F9d64FD0975C39',
    ROBO_ADVISOR: '0x9C4f167d9760682C0D2419f6dBb24d220bDc13DC',
    TEE_SIMULATION: '0xED6305527024FfDe750C5f31Cbbc7dF2Cee4C944',
    WALRUS_INTEGRATION: '0x8f17eDDB8B51d1C45e05E495515086CED2d13714',
} as const;

// Mock token addresses
export const TOKEN_ADDRESSES = {
    AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
} as const;

// Network configuration (Rootstock Testnet)
export const NETWORK_CONFIG = {
    chainId: 31, // Rootstock Testnet
    name: 'Rootstock Testnet',
    rpcUrl: 'https://public-node.testnet.rsk.co',
    blockExplorer: 'https://explorer.testnet.rsk.co',
} as const;

// Strategy configuration
export const STRATEGY_CONFIG = {
    AAVE_THRESHOLD_APY: 500, // 5% in basis points
    DEFAULT_AMOUNT: '1000000000000000000', // 1 ETH in wei
} as const;

// Mock TEE configuration
export const TEE_CONFIG = {
    MOCK_PUBLIC_KEY: '0x742d35Cc6634C0532925A3B8D4C9dB96C4B4d8B6',
    MOCK_SIGNATURE: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b',
} as const;
