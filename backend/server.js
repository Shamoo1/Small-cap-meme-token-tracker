import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { WebSocketServer } from 'ws';
import { Connection, PublicKey } from '@solana/web3.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let db;

async function initializeDatabase() {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      market_cap REAL,
      volume_24h REAL,
      liquidity REAL,
      price_change_24h REAL,
      holders INTEGER,
      liquidity_locked BOOLEAN,
      mint_disabled BOOLEAN,
      freeze_disabled BOOLEAN,
      top10_holders REAL,
      contract_age REAL,
      risk_score INTEGER,
      risk_level TEXT,
      first_detected INTEGER,
      last_updated INTEGER
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_address TEXT NOT NULL,
      alert_type TEXT NOT NULL,
      message TEXT,
      timestamp INTEGER,
      FOREIGN KEY (token_address) REFERENCES tokens(address)
    );

    CREATE TABLE IF NOT EXISTS scan_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      min_cap REAL,
      max_cap REAL,
      min_volume REAL,
      min_liquidity REAL,
      liquidity_locked BOOLEAN,
      mint_disabled BOOLEAN,
      freeze_disabled BOOLEAN,
      top_holders_limit REAL
    );

    CREATE INDEX IF NOT EXISTS idx_token_address ON tokens(address);
    CREATE INDEX IF NOT EXISTS idx_alert_timestamp ON alerts(timestamp);
    CREATE INDEX IF NOT EXISTS idx_risk_level ON tokens(risk_level);
  `);

  console.log('✅ Database initialized');
}

// Solana connection
const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');

// Token scanner class
class SolanaTokenScanner {
  constructor(wsServer) {
    this.wsServer = wsServer;
    this.isScanning = false;
    this.scanInterval = null;
    this.filters = {
      minCap: 5000,
      maxCap: 15000,
      minVolume: 1000,
      minLiquidity: 3000,
      liquidityLocked: true,
      mintDisabled: true,
      freezeDisabled: true,
      topHoldersLimit: 30
    };
  }

  async startScanning(filters) {
    if (this.isScanning) return;
    
    this.isScanning = true;
    this.filters = { ...this.filters, ...filters };
    
    console.log('🔍 Starting token scan with filters:', this.filters);
    
    // Scan every 10 seconds
    this.scanInterval = setInterval(() => {
      this.scanForTokens();
    }, 10000);
    
    // Initial scan
    this.scanForTokens();
  }

  stopScanning() {
    this.isScanning = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    console.log('🛑 Stopped token scanning');
  }

  async scanForTokens() {
    try {
      // In production, this would connect to DexScreener API, Jupiter API, or Birdeye API
      // For demo purposes, we'll simulate token discovery
      const token = this.generateSimulatedToken();
      
      if (this.passesFilters(token)) {
        await this.saveToken(token);
        await this.createAlert(token);
        this.broadcastToken(token);
      }
    } catch (error) {
      console.error('Error scanning tokens:', error);
    }
  }

  generateSimulatedToken() {
    const names = [
      'PEPE2.0', 'BONK', 'DOGWIFHAT', 'SAMO', 'COPE', 'ROPE',
      'HODL', 'MOON', 'ROCKET', 'DEGEN', 'WOJAK', 'CHAD',
      'BASED', 'GIGA', 'SIGMA', 'ALPHA', 'MEME', 'SHIB2'
    ];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const symbol = name.substring(0, 4).toUpperCase();
    
    const marketCap = this.filters.minCap + Math.random() * (this.filters.maxCap - this.filters.minCap);
    const volume24h = this.filters.minVolume + Math.random() * 20000;
    const liquidity = this.filters.minLiquidity + Math.random() * 10000;
    
    const liquidityLocked = Math.random() > 0.3;
    const mintDisabled = Math.random() > 0.2;
    const freezeDisabled = Math.random() > 0.25;
    const top10Holders = 15 + Math.random() * 40;
    const contractAge = Math.random() * 48;
    
    const riskScore = this.calculateRiskScore({
      liquidityLocked,
      mintDisabled,
      freezeDisabled,
      top10Holders,
      contractAge,
      liquidity,
      volume24h
    });

    return {
      address: this.generateAddress(),
      name,
      symbol,
      marketCap,
      volume24h,
      liquidity,
      priceChange24h: -10 + Math.random() * 40,
      holders: Math.floor(100 + Math.random() * 900),
      security: {
        liquidityLocked,
        mintDisabled,
        freezeDisabled,
        top10Holders,
        contractAge
      },
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      timestamp: Date.now()
    };
  }

  generateAddress() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
    let address = '';
    for (let i = 0; i < 44; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  calculateRiskScore(security) {
    let score = 100;
    
    if (!security.liquidityLocked) score -= 30;
    if (!security.mintDisabled) score -= 25;
    if (!security.freezeDisabled) score -= 20;
    
    if (security.top10Holders > 30) {
      score -= 15;
    } else if (security.top10Holders > 25) {
      score -= 10;
    } else if (security.top10Holders > 20) {
      score -= 5;
    }
    
    if (security.contractAge < 1) {
      score -= 10;
    } else if (security.contractAge < 6) {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  getRiskLevel(score) {
    if (score >= 70) return 'safe';
    if (score >= 40) return 'moderate';
    return 'high';
  }

  passesFilters(token) {
    const f = this.filters;
    
    if (token.marketCap < f.minCap || token.marketCap > f.maxCap) return false;
    if (token.volume24h < f.minVolume) return false;
    if (token.liquidity < f.minLiquidity) return false;
    
    if (f.liquidityLocked && !token.security.liquidityLocked) return false;
    if (f.mintDisabled && !token.security.mintDisabled) return false;
    if (f.freezeDisabled && !token.security.freezeDisabled) return false;
    if (token.security.top10Holders >= f.topHoldersLimit) return false;
    
    return true;
  }

  async saveToken(token) {
    try {
      await db.run(`
        INSERT OR REPLACE INTO tokens (
          address, name, symbol, market_cap, volume_24h, liquidity,
          price_change_24h, holders, liquidity_locked, mint_disabled,
          freeze_disabled, top10_holders, contract_age, risk_score,
          risk_level, first_detected, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        token.address,
        token.name,
        token.symbol,
        token.marketCap,
        token.volume24h,
        token.liquidity,
        token.priceChange24h,
        token.holders,
        token.security.liquidityLocked ? 1 : 0,
        token.security.mintDisabled ? 1 : 0,
        token.security.freezeDisabled ? 1 : 0,
        token.security.top10Holders,
        token.security.contractAge,
        token.riskScore,
        token.riskLevel,
        token.timestamp,
        token.timestamp
      ]);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async createAlert(token) {
    try {
      let alertType = 'new_token';
      let message = `New ${token.riskLevel} risk token detected: ${token.name}`;
      
      if (token.riskLevel === 'high') {
        alertType = 'high_risk';
        message = `⚠️ HIGH RISK: ${token.name} - Review security parameters`;
      } else if (token.riskLevel === 'safe') {
        alertType = 'safe_opportunity';
        message = `✅ SAFE: ${token.name} - All security checks passed`;
      }

      await db.run(`
        INSERT INTO alerts (token_address, alert_type, message, timestamp)
        VALUES (?, ?, ?, ?)
      `, [token.address, alertType, message, token.timestamp]);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  broadcastToken(token) {
    this.wsServer.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type: 'new_token',
          data: token
        }));
      }
    });
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/tokens', async (req, res) => {
  try {
    const { limit = 50, riskLevel } = req.query;
    
    let query = 'SELECT * FROM tokens';
    const params = [];
    
    if (riskLevel) {
      query += ' WHERE risk_level = ?';
      params.push(riskLevel);
    }
    
    query += ' ORDER BY last_updated DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const tokens = await db.all(query, params);
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tokens/:address', async (req, res) => {
  try {
    const token = await db.get('SELECT * FROM tokens WHERE address = ?', req.params.address);
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const { limit = 100, type } = req.query;
    
    let query = 'SELECT * FROM alerts';
    const params = [];
    
    if (type) {
      query += ' WHERE alert_type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const alerts = await db.all(query, params);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      total: await db.get('SELECT COUNT(*) as count FROM tokens'),
      safe: await db.get('SELECT COUNT(*) as count FROM tokens WHERE risk_level = "safe"'),
      moderate: await db.get('SELECT COUNT(*) as count FROM tokens WHERE risk_level = "moderate"'),
      high: await db.get('SELECT COUNT(*) as count FROM tokens WHERE risk_level = "high"'),
      alerts: await db.get('SELECT COUNT(*) as count FROM alerts'),
      recentAlerts: await db.all('SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 10')
    };
    
    res.json({
      totalTokens: stats.total.count,
      safeTokens: stats.safe.count,
      moderateRisk: stats.moderate.count,
      highRisk: stats.high.count,
      totalAlerts: stats.alerts.count,
      recentAlerts: stats.recentAlerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scan/start', async (req, res) => {
  try {
    const filters = req.body;
    scanner.startScanning(filters);
    res.json({ status: 'scanning', filters });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/scan/stop', (req, res) => {
  scanner.stopScanning();
  res.json({ status: 'stopped' });
});

// Initialize server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  await initializeDatabase();
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('📡 New WebSocket connection');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('📡 WebSocket connection closed');
  });
});

// Initialize scanner
const scanner = new SolanaTokenScanner(wss);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  scanner.stopScanning();
  await db.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});