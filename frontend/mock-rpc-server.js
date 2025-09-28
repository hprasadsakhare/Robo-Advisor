const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes (development: allow any localhost origin)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// Mock RPC responses for development
const mockResponses = {
  'eth_blockNumber': '0x1234567', // Mock block number
  'eth_chainId': '0x1f', // Chain ID 31 (Rootstock testnet)
  'eth_call': '0x0000000000000000000000000000000000000000000000000000000000000000', // Default empty response
  'eth_getBalance': '0x1bc16d674ec80000', // 2 ETH in wei
  'eth_gasPrice': '0x3b9aca00', // 1 gwei
  'net_version': '31',
  'web3_clientVersion': 'MockRPC/1.0.0'
};

// Handle POST requests to /rpc (main RPC endpoint)
app.post('/rpc', (req, res) => {
  const { method, params, id } = req.body;
  
  console.log(`Mock RPC Request: ${method}`, params ? `with params: ${JSON.stringify(params)}` : '');
  
  // Handle specific contract calls
  if (method === 'eth_call' && params && params[0]) {
    const callData = params[0];
    
    // Mock responses for specific contract methods
    if (callData.data) {
      // getTotalAgents() - function selector: 0x3731a16f
      if (callData.data.startsWith('0x3731a16f')) {
        return res.json({
          jsonrpc: '2.0',
          id,
          result: '0x0000000000000000000000000000000000000000000000000000000000000000' // Return 0 agents to avoid parsing errors
        });
      }
      
      // getAgentCard() - function selector: 0x8b2624a9
      if (callData.data.startsWith('0x8b2624a9')) {
        // Return empty tuple structure for agent card
        return res.json({
          jsonrpc: '2.0',
          id,
          result: '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
        });
      }
      
      // getTotalExecutions() - function selector: 0x9a8a0592
      if (callData.data.startsWith('0x9a8a0592')) {
        return res.json({
          jsonrpc: '2.0',
          id,
          result: '0x0000000000000000000000000000000000000000000000000000000000000000' // Return 0 executions
        });
      }
      
      // getCurrentApyInfo() - mock APY data
      if (callData.data.startsWith('0x1234abcd')) {
        return res.json({
          jsonrpc: '2.0',
          id,
          result: '0x00000000000000000000000000000000000000000000000000000000000001f40000000000000000000000000000000000000000000000000000000000000258000000000000000000000000000000000000000000000000000000000000012c' // Mock APY values
        });
      }
    }
  }
  
  // Default mock response
  const result = mockResponses[method] || '0x0';
  
  res.json({
    jsonrpc: '2.0',
    id,
    result
  });
});

// Handle POST requests to root (fallback)
app.post('/', (req, res) => {
  res.redirect(307, '/rpc');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mock Rootstock RPC Server',
    note: 'This is a development mock server. Contract calls will return empty/zero values.'
  });
});

// Catch all for debugging
app.use((req, res) => {
  console.log(`Unhandled request: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock Rootstock RPC server running on http://localhost:${PORT}`);
  console.log(`📡 Serving mock responses for development`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`⚠️  Note: This is a mock server - contract data will be empty/zero`);
});
