import { StockData, HistoricalData, SentimentData, PredictionData } from '../types/stock';

// API Configuration
const API_CONFIG = {
  provider: import.meta.env.VITE_API_PROVIDER || 'mock',
  alphaVantageKey: import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
  finnhubKey: import.meta.env.VITE_FINNHUB_API_KEY,
  polygonKey: import.meta.env.VITE_POLYGON_API_KEY,
  enableWebSocket: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true',
  updateInterval: parseInt(import.meta.env.VITE_UPDATE_INTERVAL || '30000')
};

// Rate limiting and caching
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limits = {
    alphavantage: { calls: 5, window: 60000 }, // 5 calls per minute
    finnhub: { calls: 60, window: 60000 },     // 60 calls per minute
    polygon: { calls: 5, window: 60000 }       // 5 calls per minute (free tier)
  };

  canMakeRequest(provider: string): boolean {
    const limit = this.limits[provider as keyof typeof this.limits];
    if (!limit) return true;

    const now = Date.now();
    const requests = this.requests.get(provider) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < limit.window);
    this.requests.set(provider, validRequests);
    
    return validRequests.length < limit.calls;
  }

  recordRequest(provider: string): void {
    const requests = this.requests.get(provider) || [];
    requests.push(Date.now());
    this.requests.set(provider, requests);
  }
}

const rateLimiter = new RateLimiter();

// Cache implementation
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new DataCache();

// Real-time API service
class RealTimeStockApi {
  private wsConnections = new Map<string, WebSocket>();
  private subscribers = new Map<string, Set<(data: any) => void>>();

  // Alpha Vantage API implementation
  private async fetchFromAlphaVantage(symbol: string, endpoint: string): Promise<any> {
    if (!API_CONFIG.alphaVantageKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    if (!rateLimiter.canMakeRequest('alphavantage')) {
      throw new Error('Rate limit exceeded for Alpha Vantage API');
    }

    const baseUrl = 'https://www.alphavantage.co/query';
    const params = new URLSearchParams({
      function: endpoint,
      symbol: symbol.toUpperCase(),
      apikey: API_CONFIG.alphaVantageKey
    });

    rateLimiter.recordRequest('alphavantage');
    
    const response = await fetch(`${baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(`Invalid symbol: ${symbol}`);
    }
    
    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    return data;
  }

  // Finnhub API implementation
  private async fetchFromFinnhub(symbol: string, endpoint: string): Promise<any> {
    if (!API_CONFIG.finnhubKey) {
      throw new Error('Finnhub API key not configured');
    }

    if (!rateLimiter.canMakeRequest('finnhub')) {
      throw new Error('Rate limit exceeded for Finnhub API');
    }

    const baseUrl = 'https://finnhub.io/api/v1';
    const url = `${baseUrl}/${endpoint}?symbol=${symbol.toUpperCase()}&token=${API_CONFIG.finnhubKey}`;

    rateLimiter.recordRequest('finnhub');
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    return response.json();
  }

  // WebSocket connection for real-time updates
  private setupWebSocket(symbol: string): void {
    if (!API_CONFIG.enableWebSocket || !API_CONFIG.finnhubKey) return;

    const wsKey = symbol.toUpperCase();
    if (this.wsConnections.has(wsKey)) return;

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${API_CONFIG.finnhubKey}`);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for ${symbol}`);
      ws.send(JSON.stringify({ type: 'subscribe', symbol: wsKey }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'trade' && data.data) {
          const subscribers = this.subscribers.get(wsKey);
          if (subscribers) {
            subscribers.forEach(callback => {
              callback({
                symbol: wsKey,
                price: data.data[0]?.p,
                volume: data.data[0]?.v,
                timestamp: data.data[0]?.t
              });
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for ${symbol}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for ${symbol}`);
      this.wsConnections.delete(wsKey);
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (this.subscribers.get(wsKey)?.size) {
          this.setupWebSocket(symbol);
        }
      }, 5000);
    };

    this.wsConnections.set(wsKey, ws);
  }

  // Subscribe to real-time updates
  subscribeToRealTime(symbol: string, callback: (data: any) => void): () => void {
    const wsKey = symbol.toUpperCase();
    
    if (!this.subscribers.has(wsKey)) {
      this.subscribers.set(wsKey, new Set());
    }
    
    this.subscribers.get(wsKey)!.add(callback);
    
    // Setup WebSocket connection
    this.setupWebSocket(symbol);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(wsKey);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          // Close WebSocket if no more subscribers
          const ws = this.wsConnections.get(wsKey);
          if (ws) {
            ws.close();
            this.wsConnections.delete(wsKey);
          }
          this.subscribers.delete(wsKey);
        }
      }
    };
  }

  // Get real-time stock data
  async getStockData(symbol: string): Promise<StockData> {
    const cacheKey = `stock_${symbol}_${API_CONFIG.provider}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      let data: StockData;

      switch (API_CONFIG.provider) {
        case 'alphavantage':
          data = await this.getStockDataFromAlphaVantage(symbol);
          break;
        case 'finnhub':
          data = await this.getStockDataFromFinnhub(symbol);
          break;
        case 'polygon':
          data = await this.getStockDataFromPolygon(symbol);
          break;
        default:
          // Fallback to mock data with enhanced realism
          data = await this.getMockStockData(symbol);
      }

      // Cache for 30 seconds for real-time data
      cache.set(cacheKey, data, 30000);
      return data;

    } catch (error) {
      console.warn(`Failed to fetch from ${API_CONFIG.provider}, falling back to mock data:`, error);
      return this.getMockStockData(symbol);
    }
  }

  private async getStockDataFromAlphaVantage(symbol: string): Promise<StockData> {
    const data = await this.fetchFromAlphaVantage(symbol, 'GLOBAL_QUOTE');
    const quote = data['Global Quote'];
    
    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Company`,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      marketCap: 0, // Not available in this endpoint
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close'])
    };
  }

  private async getStockDataFromFinnhub(symbol: string): Promise<StockData> {
    const [quote, profile] = await Promise.all([
      this.fetchFromFinnhub(symbol, 'quote'),
      this.fetchFromFinnhub(symbol, 'stock/profile2')
    ]);
    
    return {
      symbol: symbol.toUpperCase(),
      name: profile.name || `${symbol.toUpperCase()} Company`,
      price: quote.c,
      change: quote.d,
      changePercent: quote.dp,
      volume: 0, // Not in quote endpoint
      marketCap: profile.marketCapitalization * 1000000 || 0,
      high: quote.h,
      low: quote.l,
      open: quote.o,
      previousClose: quote.pc
    };
  }

  private async getStockDataFromPolygon(symbol: string): Promise<StockData> {
    // Polygon implementation would go here
    // For now, fallback to mock data
    return this.getMockStockData(symbol);
  }

  private async getMockStockData(symbol: string): Promise<StockData> {
    // Enhanced mock data with more realistic price movements
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
    
    const basePrice = 100 + Math.random() * 400;
    const volatility = 0.02 + Math.random() * 0.03; // 2-5% volatility
    const trend = (Math.random() - 0.5) * 0.01; // Small trend bias
    
    const change = basePrice * (trend + (Math.random() - 0.5) * volatility);
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Company`,
      price: Number((basePrice + change).toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
      high: Number((basePrice + Math.abs(change) + Math.random() * 10).toFixed(2)),
      low: Number((basePrice - Math.abs(change) - Math.random() * 10).toFixed(2)),
      open: Number((basePrice + (Math.random() - 0.5) * 5).toFixed(2)),
      previousClose: Number(basePrice.toFixed(2))
    };
  }

  // Get historical data with real-time updates
  async getHistoricalData(symbol: string, range: string): Promise<HistoricalData[]> {
    const cacheKey = `historical_${symbol}_${range}_${API_CONFIG.provider}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      let data: HistoricalData[];

      switch (API_CONFIG.provider) {
        case 'alphavantage':
          data = await this.getHistoricalFromAlphaVantage(symbol, range);
          break;
        case 'finnhub':
          data = await this.getHistoricalFromFinnhub(symbol, range);
          break;
        default:
          data = await this.getMockHistoricalData(symbol, range);
      }

      // Cache historical data for 5 minutes
      cache.set(cacheKey, data, 300000);
      return data;

    } catch (error) {
      console.warn(`Failed to fetch historical data from ${API_CONFIG.provider}:`, error);
      return this.getMockHistoricalData(symbol, range);
    }
  }

  private async getHistoricalFromAlphaVantage(symbol: string, range: string): Promise<HistoricalData[]> {
    const endpoint = range === '1D' ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY';
    const data = await this.fetchFromAlphaVantage(symbol, endpoint);
    
    const timeSeriesKey = range === '1D' ? 'Time Series (5min)' : 'Time Series (Daily)';
    const timeSeries = data[timeSeriesKey];
    
    if (!timeSeries) {
      throw new Error('No historical data available');
    }

    return Object.entries(timeSeries)
      .slice(0, this.getRangeDays(range))
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }))
      .reverse();
  }

  private async getHistoricalFromFinnhub(symbol: string, range: string): Promise<HistoricalData[]> {
    const days = this.getRangeDays(range);
    const to = Math.floor(Date.now() / 1000);
    const from = to - (days * 24 * 60 * 60);
    
    const url = `candles?symbol=${symbol}&resolution=D&from=${from}&to=${to}`;
    const data = await this.fetchFromFinnhub(symbol, url);
    
    if (data.s !== 'ok') {
      throw new Error('No historical data available');
    }

    return data.t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      volume: data.v[index]
    }));
  }

  private async getMockHistoricalData(symbol: string, range: string): Promise<HistoricalData[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const days = this.getRangeDays(range);
    const data: HistoricalData[] = [];
    const basePrice = 100 + Math.random() * 400;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const volatility = 0.02;
      const trend = (Math.random() - 0.5) * 0.001;
      const dailyChange = (Math.random() - 0.5) * volatility + trend;
      
      const prevClose = i === days ? basePrice : data[data.length - 1]?.close || basePrice;
      const open = prevClose * (1 + (Math.random() - 0.5) * 0.01);
      const close = open * (1 + dailyChange);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      
      data.push({
        date: date.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume: Math.floor(Math.random() * 5000000) + 500000
      });
    }

    return data;
  }

  private getRangeDays(range: string): number {
    switch (range) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      case '2Y': return 730;
      default: return 30;
    }
  }

  // Sentiment and prediction methods (using existing mock implementations)
  async getSentimentData(symbol: string, days: number = 30): Promise<SentimentData[]> {
    // Implementation would integrate with news APIs
    // For now, using enhanced mock data
    return this.getMockSentimentData(symbol, days);
  }

  async getPredictionData(symbol: string): Promise<PredictionData[]> {
    // Implementation would use ML models
    // For now, using enhanced mock data
    return this.getMockPredictionData(symbol);
  }

  private async getMockSentimentData(symbol: string, days: number): Promise<SentimentData[]> {
    const data: SentimentData[] = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const positive = Math.random() * 0.6 + 0.2;
      const negative = Math.random() * 0.4 + 0.1;
      const neutral = 1 - positive - negative;
      const score = positive - negative;
      
      data.push({
        date: date.toISOString().split('T')[0],
        positive: Number(positive.toFixed(3)),
        neutral: Number(neutral.toFixed(3)),
        negative: Number(negative.toFixed(3)),
        score: Number(score.toFixed(3))
      });
    }

    return data;
  }

  private async getMockPredictionData(symbol: string): Promise<PredictionData[]> {
    const data: PredictionData[] = [];
    const basePrice = 100 + Math.random() * 400;
    
    for (let i = 1; i <= 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const trend = (Math.random() - 0.5) * 0.02;
      const predicted = basePrice * (1 + trend * i);
      const confidence = Math.max(0.6, 1 - (i * 0.1));
      
      data.push({
        date: date.toISOString().split('T')[0],
        predicted: Number(predicted.toFixed(2)),
        confidence: Number(confidence.toFixed(2))
      });
    }

    return data;
  }

  // Cleanup method
  cleanup(): void {
    this.wsConnections.forEach(ws => ws.close());
    this.wsConnections.clear();
    this.subscribers.clear();
    cache.clear();
  }
}

export const realTimeStockApi = new RealTimeStockApi();