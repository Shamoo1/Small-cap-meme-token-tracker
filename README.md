# Solana Meme Token Scanner

A production-ready real-time scanner and tracker for Solana meme tokens with advanced rugpull detection and security analysis.

## Features

### 🔍 Real-Time Scanning
- Continuous monitoring of new token launches
- Customizable market cap filters ($5K - $15K default range)
- Volume and liquidity thresholds
- Live WebSocket updates

### 🛡️ Security Analysis
- **Liquidity Lock Detection** - Identifies locked liquidity pools
- **Mint Authority Check** - Verifies if minting is disabled
- **Freeze Authority Check** - Ensures freeze authority is revoked
- **Holder Distribution** - Monitors top 10 holder concentration
- **Contract Age** - Tracks token age for rug risk assessment
- **Risk Scoring** - 0-100 score based on security parameters

### 📊 Risk Classification
- **Safe (70-100)** - All security checks passed
- **Moderate (40-69)** - Some risk factors present
- **High (0-39)** - Multiple red flags detected

### 🎯 Key Metrics Tracked
- Market Capitalization
- 24-hour Trading Volume
- Liquidity Pool Size
- Price Changes
- Holder Count
- Top Holder Concentration

## Tech Stack

### Frontend
- Vanilla JavaScript (Static HTML)
- Tailwind CSS (CDN)
- WebSocket for real-time updates
- Clean Light theme

### Backend
- Node.js + Express
- SQLite database
- WebSocket server
- Solana Web3.js integration

## Security Parameters

The scanner uses a comprehensive risk scoring system:

- **Liquidity Locked** (30 points) - Prevents rug pulls
- **Mint Disabled** (25 points) - No new token creation
- **Freeze Disabled** (20 points) - Accounts can't be frozen
- **Holder Distribution** (15 points) - Top 10 holders < 30%
- **Contract Age** (10 points) - Minimum age thresholds

## Database Schema

### Tokens Table
- Token metadata (name, symbol, address)
- Market metrics (cap, volume, liquidity)
- Security parameters
- Risk scores and levels

### Alerts Table
- Alert type (new_token, high_risk, safe_opportunity)
- Timestamp and message
- Token association

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/tokens` - List tracked tokens
- `GET /api/tokens/:address` - Get token details
- `GET /api/alerts` - Get alerts
- `GET /api/stats` - Get statistics
- `POST /api/scan/start` - Start scanning
- `POST /api/scan/stop` - Stop scanning

## Preview

Configured to run on `0.0.0.0:8080` (frontend) and `0.0.0.0:3000` (backend) for production deployment.

## Environment Variables

### Backend (.env)
```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PORT=3000
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3000
```

## Integration Points

The scanner can integrate with:
- **DexScreener API** - Real-time DEX data
- **Jupiter API** - Price and liquidity data
- **Birdeye API** - Token analytics
- **Solscan API** - On-chain data

## Rugpull Prevention

The scanner actively prevents rugpull exposure by:

1. **Pre-filtering** tokens without liquidity locks
2. **Monitoring** mint/freeze authorities
3. **Analyzing** holder distribution patterns
4. **Tracking** contract age and deployment
5. **Alerting** on suspicious activity

## Theme

Clean Light theme with:
- White/light gray backgrounds (#F8F8F8)
- Soft shadows and rounded corners
- Purple accent color for CTAs
- Pastel status indicators (green/yellow/red)
- Professional, minimal SaaS aesthetic