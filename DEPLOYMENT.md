# Deployment Guide

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env with your values
nano .env
```

### 2. Local Development (Anvil)

```bash
# Terminal 1: Start local node
anvil

# Terminal 2: Deploy contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### 3. Testnet Deployment (Sepolia)

```bash
# Deploy to Sepolia
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify

# Deploy and run sample test
forge script script/Deploy.s.sol:Deploy --sig "deployAndTest()" --rpc-url $RPC_URL --broadcast
```

## Contract Addresses

After deployment, you'll see output like:

```
=== DEPLOYMENT SUMMARY ===
IdentityRegistry: 0x...
ValidationRegistry: 0x...
TEESimulation: 0x...
WalrusIntegration: 0x...
RoboAdvisor: 0x...
========================
```

## Usage Example

```solidity
// 1. Register agent
bytes32 agentId = keccak256(abi.encodePacked("MyAgent", block.timestamp));
identityRegistry.registerAgent(agentId, "My Robo-Advisor", "Strategy description");

// 2. Generate TEE proof
(bytes32 proofId, bytes32 proofHash, bytes memory signature) = teeSimulation.generateProof(
    agentId, "Strategy result", "transaction data"
);

// 3. Store in Walrus
bytes memory proofData = abi.encode(proofId, proofHash, agentId, "result", signature);
(string memory walrusId, bytes32 walrusProofHash) = walrusIntegration.storeProof(proofData, agentId);

// 4. Submit to Validation Registry
validationRegistry.submitProof(proofId, agentId, walrusProofHash, walrusId, signature);

// 5. Execute strategy
roboAdvisor.executeStrategy(agentId, 1000 * 10**18, proofId);
```

## Testing

```bash
# Run all tests
forge test -vv

# Run specific test
forge test --match-test testFullWorkflow -vv

# Run with gas report
forge test --gas-report
```

## Configuration

- **AAVE_THRESHOLD_APY**: 500 basis points (5%)
- **Mock Aave APY**: 600 basis points (6%)
- **Mock Uniswap APY**: 300 basis points (3%)

## Security Notes

⚠️ This is a hackathon/prototype implementation:
- Uses mock TEE with hardcoded keys
- Simulates Walrus storage
- Uses mock APY data
- No real DeFi integration

For production, implement real TEE attestation, Walrus API, oracle data, and DeFi protocols.
