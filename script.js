// Solana Meme Token Scanner
class TokenScanner {
  constructor() {
    this.isScanning = false;
    this.tokens = [];
    this.scannedCount = 0;
    this.stats = { safe: 0, moderate: 0, risk: 0, total: 0 };
    
    this.filters = {
      minCap: 5000,
      maxCap: 15000,
      minVolume: 1000,
      minLiquidity: 3000,
      liquidityLocked: true,
      mintDisabled: true,
      freezeDisabled: true,
      topHolders: true
    };

    this.initializeElements();
    this.attachEventListeners();
    this.simulateConnection();
  }

  initializeElements() {
    this.elements = {
      startBtn: document.getElementById('startScan'),
      stopBtn: document.getElementById('stopScan'),
      resetBtn: document.getElementById('resetFilters'),
      tokenList: document.getElementById('tokenList'),
      scannedCount: document.getElementById('scannedCount'),
      safeCount: document.getElementById('safeCount'),
      moderateCount: document.getElementById('moderateCount'),
      riskCount: document.getElementById('riskCount'),
      totalAlerts: document.getElementById('totalAlerts'),
      connectionStatus: document.getElementById('connectionStatus'),
      connectionText: document.getElementById('connectionText'),
      sortByTime: document.getElementById('sortByTime'),
      sortByRisk: document.getElementById('sortByRisk'),
      
      // Filters
      minCap: document.getElementById('minCap'),
      maxCap: document.getElementById('maxCap'),
      minVolume: document.getElementById('minVolume'),
      minLiquidity: document.getElementById('minLiquidity'),
      filterLiquidityLocked: document.getElementById('filterLiquidityLocked'),
      filterMintDisabled: document.getElementById('filterMintDisabled'),
      filterFreezeDisabled: document.getElementById('filterFreezeDisabled'),
      filterTopHolders: document.getElementById('filterTopHolders')
    };
  }

  attachEventListeners() {
    this.elements.startBtn.addEventListener('click', () => this.startScanning());
    this.elements.stopBtn.addEventListener('click', () => this.stopScanning());
    this.elements.resetBtn.addEventListener('click', () => this.resetFilters());
    this.elements.sortByTime.addEventListener('click', () => this.sortTokens('time'));
    this.elements.sortByRisk.addEventListener('click', () => this.sortTokens('risk'));
  }

  simulateConnection() {
    setTimeout(() => {
      this.elements.connectionStatus.className = 'w-2 h-2 rounded-full bg-green-500 pulse-glow';
      this.elements.connectionText.textContent = 'Connected';
    }, 1500);
  }

  getFilters() {
    return {
      minCap: parseFloat(this.elements.minCap.value) || 5000,
      maxCap: parseFloat(this.elements.maxCap.value) || 15000,
      minVolume: parseFloat(this.elements.minVolume.value) || 1000,
      minLiquidity: parseFloat(this.elements.minLiquidity.value) || 3000,
      liquidityLocked: this.elements.filterLiquidityLocked.checked,
      mintDisabled: this.elements.filterMintDisabled.checked,
      freezeDisabled: this.elements.filterFreezeDisabled.checked,
      topHolders: this.elements.filterTopHolders.checked
    };
  }

  resetFilters() {
    this.elements.minCap.value = 5000;
    this.elements.maxCap.value = 15000;
    this.elements.minVolume.value = 1000;
    this.elements.minLiquidity.value = 3000;
    this.elements.filterLiquidityLocked.checked = true;
    this.elements.filterMintDisabled.checked = true;
    this.elements.filterFreezeDisabled.checked = true;
    this.elements.filterTopHolders.checked = true;
  }

  startScanning() {
    this.isScanning = true;
    this.filters = this.getFilters();
    this.elements.startBtn.disabled = true;
    this.elements.stopBtn.disabled = false;
    this.elements.startBtn.textContent = 'Scanning...';
    
    // Simulate token detection
    this.scanInterval = setInterval(() => {
      this.scannedCount++;
      this.elements.scannedCount.textContent = this.scannedCount;
      
      // Randomly detect tokens (10% chance)
      if (Math.random() < 0.1) {
        const token = this.generateToken();
        this.addToken(token);
      }
    }, 2000);
  }

  stopScanning() {
    this.isScanning = false;
    clearInterval(this.scanInterval);
    this.elements.startBtn.disabled = false;
    this.elements.stopBtn.disabled = true;
    this.elements.startBtn.textContent = 'Start Scanning';
  }

  generateToken() {
    const names = [
      'PEPE2.0', 'BONK', 'DOGWIFHAT', 'SAMO', 'COPE', 'ROPE',
      'HODL', 'MOON', 'ROCKET', 'DEGEN', 'WOJAK', 'CHAD',
      'BASED', 'GIGA', 'SIGMA', 'ALPHA', 'MEME', 'SHIB2'
    ];
    
    const name = names[Math.floor(Math.random() * names.length)];
    const symbol = name.substring(0, 4).toUpperCase();
    
    // Generate metrics within filter range
    const marketCap = this.filters.minCap + Math.random() * (this.filters.maxCap - this.filters.minCap);
    const volume24h = this.filters.minVolume + Math.random() * 20000;
    const liquidity = this.filters.minLiquidity + Math.random() * 10000;
    
    // Security analysis
    const liquidityLocked = Math.random() > 0.3;
    const mintDisabled = Math.random() > 0.2;
    const freezeDisabled = Math.random() > 0.25;
    const top10Holders = 15 + Math.random() * 40;
    const contractAge = Math.random() * 48; // hours
    
    // Calculate risk score
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
      id: Date.now() + Math.random(),
      name,
      symbol,
      address: this.generateAddress(),
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
    
    // Liquidity locked (30 points)
    if (!security.liquidityLocked) score -= 30;
    
    // Mint disabled (25 points)
    if (!security.mintDisabled) score -= 25;
    
    // Freeze disabled (20 points)
    if (!security.freezeDisabled) score -= 20;
    
    // Top 10 holders (15 points)
    if (security.top10Holders > 30) {
      score -= 15;
    } else if (security.top10Holders > 25) {
      score -= 10;
    } else if (security.top10Holders > 20) {
      score -= 5;
    }
    
    // Contract age (10 points)
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

  addToken(token) {
    // Check if token passes filters
    if (!this.passesFilters(token)) return;

    this.tokens.unshift(token);
    this.updateStats();
    this.renderTokens();
    this.showNotification(token);
  }

  passesFilters(token) {
    const f = this.filters;
    
    if (f.liquidityLocked && !token.security.liquidityLocked) return false;
    if (f.mintDisabled && !token.security.mintDisabled) return false;
    if (f.freezeDisabled && !token.security.freezeDisabled) return false;
    if (f.topHolders && token.security.top10Holders >= 30) return false;
    
    return true;
  }

  updateStats() {
    this.stats = { safe: 0, moderate: 0, risk: 0, total: 0 };
    
    this.tokens.forEach(token => {
      this.stats.total++;
      if (token.riskLevel === 'safe') this.stats.safe++;
      else if (token.riskLevel === 'moderate') this.stats.moderate++;
      else this.stats.risk++;
    });

    this.elements.safeCount.textContent = this.stats.safe;
    this.elements.moderateCount.textContent = this.stats.moderate;
    this.elements.riskCount.textContent = this.stats.risk;
    this.elements.totalAlerts.textContent = this.stats.total;
  }

  renderTokens() {
    if (this.tokens.length === 0) {
      this.elements.tokenList.innerHTML = `
        <div class="p-12 text-center text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-lg font-medium">Start scanning to detect tokens</p>
          <p class="text-sm mt-1">Tokens matching your criteria will appear here</p>
        </div>
      `;
      return;
    }

    this.elements.tokenList.innerHTML = this.tokens.map(token => this.renderToken(token)).join('');
  }

  renderToken(token) {
    const riskColors = {
      safe: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      moderate: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
      high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
    };

    const colors = riskColors[token.riskLevel];
    const priceChangeColor = token.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600';
    const priceChangeIcon = token.priceChange24h >= 0 ? '↑' : '↓';

    return `
      <div class="p-6 hover:bg-gray-50 transition-colors slide-in">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              ${token.symbol.substring(0, 2)}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-bold text-gray-900">${token.name}</h3>
                <span class="text-sm text-gray-500">$${token.symbol}</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="font-mono">${token.address.substring(0, 8)}...${token.address.substring(token.address.length - 6)}</span>
                <button onclick="navigator.clipboard.writeText('${token.address}')" class="text-purple-600 hover:text-purple-700">
                  Copy
                </button>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}">
                ${token.riskLevel.toUpperCase()} • ${token.riskScore}/100
              </span>
            </div>
            <div class="text-xs text-gray-500">${this.getTimeAgo(token.timestamp)}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">Market Cap</div>
            <div class="text-sm font-bold text-gray-900">$${this.formatNumber(token.marketCap)}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">24h Volume</div>
            <div class="text-sm font-bold text-gray-900">$${this.formatNumber(token.volume24h)}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Liquidity</div>
            <div class="text-sm font-bold text-gray-900">$${this.formatNumber(token.liquidity)}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">24h Change</div>
            <div class="text-sm font-bold ${priceChangeColor}">${priceChangeIcon} ${Math.abs(token.priceChange24h).toFixed(2)}%</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">Holders</div>
            <div class="text-sm font-bold text-gray-900">${this.formatNumber(token.holders)}</div>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-700">Security Analysis</h4>
            <span class="text-xs text-gray-500">Contract Age: ${token.security.contractAge.toFixed(1)}h</span>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            ${this.renderSecurityBadge('Liquidity Locked', token.security.liquidityLocked)}
            ${this.renderSecurityBadge('Mint Disabled', token.security.mintDisabled)}
            ${this.renderSecurityBadge('Freeze Disabled', token.security.freezeDisabled)}
            ${this.renderSecurityBadge(`Top 10: ${token.security.top10Holders.toFixed(1)}%`, token.security.top10Holders < 30)}
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          <a href="https://dexscreener.com/solana/${token.address}" target="_blank" 
            class="flex-1 text-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            View on DEXScreener
          </a>
          <a href="https://birdeye.so/token/${token.address}?chain=solana" target="_blank"
            class="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            View on Birdeye
          </a>
        </div>
      </div>
    `;
  }

  renderSecurityBadge(label, passed) {
    const icon = passed 
      ? '<svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
      : '<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>';
    
    const bgColor = passed ? 'bg-green-50' : 'bg-red-50';
    const textColor = passed ? 'text-green-700' : 'text-red-700';

    return `
      <div class="flex items-center gap-2 px-3 py-2 ${bgColor} rounded-lg">
        ${icon}
        <span class="text-xs font-medium ${textColor}">${label}</span>
      </div>
    `;
  }

  sortTokens(type) {
    if (type === 'time') {
      this.tokens.sort((a, b) => b.timestamp - a.timestamp);
    } else if (type === 'risk') {
      this.tokens.sort((a, b) => b.riskScore - a.riskScore);
    }
    this.renderTokens();
  }

  showNotification(token) {
    // Audio notification (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Token Detected', {
        body: `${token.name} ($${token.symbol}) - Risk: ${token.riskLevel.toUpperCase()}`,
        icon: '/favicon.ico'
      });
    }
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
  }

  getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

// Initialize scanner
const scanner = new TokenScanner();

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}