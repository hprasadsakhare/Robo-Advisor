const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.RPC_PROXY_PORT ? Number(process.env.RPC_PROXY_PORT) : 3006;

// Enable CORS for all routes (development: allow any localhost origin)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any localhost port for local dev & previews
    if (!origin || /localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // fallback to allow for other dev environments
  },
  credentials: true,
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Proxy middleware for Rootstock testnet
app.use('/rpc', createProxyMiddleware({
  target: 'https://public-node.testnet.rsk.co',
  changeOrigin: true,
  pathRewrite: {
    '^/rpc': '', // Remove /rpc prefix when forwarding
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'RPC connection failed', 
        message: 'Unable to connect to Rootstock testnet. The network might be down or experiencing issues.',
        details: err.message 
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying: ${req.method} ${req.url} -> ${proxyReq.getHeader('host')}${proxyReq.path}`);
  },
  logLevel: 'silent', // Reduce verbose logging
  timeout: 30000, // 30 second timeout
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Rootstock RPC Proxy Server' });
});

app.listen(PORT, () => {
  console.log(`🚀 Rootstock RPC Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: https://public-node.testnet.rsk.co`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
