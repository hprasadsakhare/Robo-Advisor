# Trustless Robo Advisor – Full Project Overview

## Introduction

This project demonstrates a trustless, on-chain robo advisor that manages strategy execution for agents on Rootstock Testnet (chainId 31). It combines smart contracts for agent identity, proof validation, and strategy execution with a React frontend that visualizes activity and provides quick actions. A local RPC proxy and a mock RPC server are included to simplify development.

## ERC‑8004 Overview (Trustless Agents)

ERC‑8004 defines a standardized trust layer for agent ecosystems, enabling agent discovery and interaction without pre‑existing trust by introducing three minimal on‑chain registries and leaving policy logic off‑chain. The standard centers on:
- Identity Registry: Censorship‑resistant agent handles resolving to off‑chain AgentCards.
- Validation Registry: A common interface to submit/fetch validation proofs bound to agents.
- Reputation Registry: Attestations and scores derived from validations and external sources.

This repository aligns with ERC‑8004 by implementing Identity and Validation registries and exposing data for off‑chain reputation computation. References:
- ERC‑8004 specification: `https://eips.ethereum.org/EIPS/eip-8004`
- Discussion thread (Magicians): `https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098`

## Key Features

- Agent registration and status tracking via `IdentityRegistry`.
- Proof submission and validation via `ValidationRegistry` (with optional Walrus storage).
- Automated strategy execution via `RoboAdvisor` with execution history and metrics.
- TEE simulation for generating mock proofs in development via `TEESimulation`.
- React frontend using `wagmi` + `viem` to read contract data and show dashboard stats.
- Local RPC proxy to avoid CORS issues and enable consistent JSON-RPC behavior.
- Mock RPC server for offline/testing scenarios.

## Core Functionality

- Agent Identity: Create and query agents through `IdentityRegistry`, resolving on‑chain IDs to off‑chain AgentCards.
- Proof Lifecycle: Submit, store, and fetch validation proofs in `ValidationRegistry`; optionally persist proof blobs via Walrus.
- Strategy Execution: Execute robo strategies on agents, track histories and aggregate metrics in `RoboAdvisor`.
- Trust Layer: Combine identity + validation on‑chain and leave reputation/thresholding off‑chain, consistent with ERC‑8004.
- Developer Workflow: Use proxy/mock RPC servers to simulate network behavior while the UI remains resilient to call failures.

## Architecture Overview

- Smart Contracts (Solidity):
  - `IdentityRegistry.sol`: Registers agents and stores metadata. Provides `getTotalAgents`, `getAgentCard`, and related queries.
  - `ValidationRegistry.sol`: Records validation proofs. Core read: `getValidationProof(bytes32)` returns a tuple with proof details.
  - `RoboAdvisor.sol`: Executes strategies and stores execution history. Reads include `getTotalExecutions`, `getAgentExecutions(bytes32)`, `getLatestExecution(bytes32)`, `getCurrentApyInfo()`.
  - `TEESimulation.sol`: Helper to generate/verify mock proofs for dev/testing.
  - `WalrusIntegration.sol`: Optional storage/retrieval integration for proof data.

- Frontend (React + TypeScript):
  - Hooks in `frontend/src/hooks/` initialize contracts with `wagmi` + `viem`.
  - Dashboard displays key stats (agents, executions, APY, thresholds) and history.
  - Contract ABIs use JSON format for complex tuple outputs to ensure reliable parsing.

- Development Utilities:
  - `proxy-server.js` proxies requests from `http://localhost:3006/rpc` to Rootstock Testnet public node.
  - `mock-rpc-server.js` provides stubbed JSON-RPC responses for offline or isolated UI testing.

## Standards Alignment

- ERC‑8004: Identity + Validation registries on‑chain; reputation derived off‑chain.
- EVM Compatibility: Contracts are Solidity‑based and compatible with Rootstock (EVM‑equivalent), so ERC‑8004 patterns apply.

## Contracts & ABIs

- ABI Strategy:
  - For simple signatures, human-readable ABI strings can work.
  - For complex outputs (`tuple` or `tuple[]`), use JSON ABIs with explicit `components` to avoid `abitype` parsing errors and to ensure `viem` generates `.read` methods.
  - This repo uses JSON ABIs for `RoboAdvisor` and `ValidationRegistry` where needed.

- Notable Signatures:
  - `ValidationRegistry.getValidationProof(bytes32 proofId) -> (tuple(proofHash, walrusReference, validator, submittedAt, isValid, agentId))`
  - `RoboAdvisor.getAgentExecutions(bytes32 agentId) -> tuple[]` containing execution details.

## Directory Structure

- `contract/src/`: Solidity sources.
- `contract/script/Deploy.s.sol`: Foundry script for deployment.
- `contract/test/`: Foundry tests (e.g., `RoboAdvisor.t.sol`).
- `frontend/src/`: React application (components, hooks, config, types).
- `frontend/proxy-server.js`: RPC proxy for local development.
- `frontend/mock-rpc-server.js`: Mock JSON-RPC server.
- `DEPLOYMENT.md`: Additional deployment notes.
- `DEVELOPMENT.md`: Development workflow notes.

## Prerequisites

- Node.js 18+ and npm.
- Foundry (for contract build, test, deploy).
- A Rootstock Testnet RPC URL and a funded testnet account for deployment.

## Setup

1. Install dependencies:
   - `cd frontend`
   - `npm install`

2. Configure environment variables:
   - Copy `frontend/env.example` to `frontend/.env`.
   - Set:
     - `REACT_APP_WALLETCONNECT_PROJECT_ID` (optional for wallet connection).
     - `RPC_PROXY_PORT` (default `3006`).
     - `REACT_APP_RPC_URL` (recommended `http://localhost:3006/rpc` or mock server at `http://localhost:3001/rpc`).
   - Contract addresses live in `frontend/src/config/contracts.ts`. Update these after deployment.

3. Start the RPC proxy (real network):
   - `node frontend/proxy-server.js`
   - Health: `http://localhost:3006/health`

4. Alternatively, start the mock RPC server (offline/testing):
   - `node frontend/mock-rpc-server.js`
   - Health: `http://localhost:3001/health`
   - Point `REACT_APP_RPC_URL` to `http://localhost:3001/rpc` and rebuild the frontend.

## Running the Frontend

- Build and serve:
  - `cd frontend`
  - `npm run build`
  - `npx serve -s build -l 3007`
  - Open `http://localhost:3007/`

- Development notes:
  - The app’s contract reads rely on the RPC URL. Ensure the proxy or mock server is running.
  - If you change `.env` or contract hooks, rebuild before serving.

## Deploying Contracts

- Configure `contract/.env` or root `.env` for Foundry:
  - `PRIVATE_KEY` (never commit real keys)
  - `RPC_URL` (Rootstock Testnet URL)

- Build & Test:
  - `cd contract`
  - `forge build`
  - `forge test`

- Deploy (example):
  - `forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY`
  - Record deployed addresses and update `frontend/src/config/contracts.ts`.

## Frontend Features

- Dashboard:
  - Displays `totalAgents`, `totalExecutions`, current APY metrics, and threshold.
  - Resilient fetching: contract call failures return sensible defaults and do not crash the UI.

- Execution History:
  - Shows latest or historical strategy executions per agent using `getAgentExecutions` and related reads.

- Quick Actions:
  - Buttons to trigger/verify flows (wired to future routes/actions as needed).

## Troubleshooting

- Invalid ABI parameter (abitype errors):
  - Cause: human-readable tuple outputs are strict and often fail parsing.
  - Fix: switch to JSON ABI with explicit `components`. This repo already uses JSON for complex outputs.

- `net::ERR_CONNECTION_REFUSED` or `net::ERR_ABORTED` to `/rpc`:
  - Cause: Proxy not running or wrong `REACT_APP_RPC_URL`.
  - Fix: Start proxy (`node frontend/proxy-server.js`) or mock server and update `.env`, then rebuild.

- `eth_call` returns `-32015 transaction reverted`:
  - Cause: Contract address doesn’t implement the called function, wrong chain, or misconfigured addresses.
  - Fix: Verify deployed addresses on chainId 31, confirm ABI matches on-chain contract, and update `frontend/src/config/contracts.ts`.

## Security Considerations

- Do not commit real `PRIVATE_KEY` or sensitive secrets.
- Validate user inputs in any write functions (production code should enforce access control and checks).
- Treat RPC and external storage (Walrus) as untrusted; verify proofs on-chain.

## License

MIT. See headers in Solidity sources where applicable.