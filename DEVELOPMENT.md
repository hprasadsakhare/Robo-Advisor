# Development Setup

## CORS Issue with Rootstock Testnet

Due to CORS restrictions on the public Rootstock testnet RPC endpoint, you need to run a local proxy server for development.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Choose your development mode:**

   **Option A - Mock RPC Server (Recommended for development):**
   ```bash
   npm run dev-mock
   ```
   This uses a mock RPC server that returns empty/zero values but allows the UI to load and function.

   **Option B - Real RPC with Proxy:**
   ```bash
   npm run dev
   ```
   This connects to the real Rootstock testnet through a proxy server.

3. **Alternative: Run separately**
   
   For mock server:
   ```bash
   # Terminal 1
   npm run mock-rpc
   
   # Terminal 2
   npm start
   ```
   
   For real RPC:
   ```bash
   # Terminal 1
   npm run proxy
   
   # Terminal 2
   npm start
   ```

## How it works

**Mock RPC Server:**
- Runs on `http://localhost:3001`
- Returns mock/empty responses for all RPC calls
- Allows the UI to load and function without network dependencies
- Perfect for UI development and testing

**Proxy Server:**
- Runs on `http://localhost:3001`
- Forwards requests to `https://public-node.testnet.rsk.co`
- Bypasses CORS restrictions during development
- Connects to real Rootstock testnet data

## Production

In production, you should:
1. Use a proper RPC provider with CORS enabled
2. Or deploy your own proxy server
3. Update the wagmi configuration accordingly

## Troubleshooting

If you see CORS errors:
1. Make sure the proxy server is running on port 3001
2. Check that no other service is using port 3001
3. Verify the React app is configured to use the proxy endpoint
