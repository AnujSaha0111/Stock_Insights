import { StockData, HistoricalData, SentimentData, PredictionData } from '../types/stock';

// Mock API service - In production, replace with real API calls
class StockApiService {
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  async getStockData(symbol: string): Promise<StockData> {
    const cacheKey = this.getCacheKey('stock', { symbol });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    // Simulate API call with realistic data
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const basePrice = 100 + Math.random() * 400;
    const change = (Math.random() - 0.5) * 20;
    const changePercent = (change / basePrice) * 100;
    
    const data: StockData = {
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

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getHistoricalData(symbol: string, range: string): Promise<HistoricalData[]> {
    const cacheKey = this.getCacheKey('historical', { symbol, range });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    
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

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getSentimentData(symbol: string, days: number = 30): Promise<SentimentData[]> {
    const cacheKey = this.getCacheKey('sentiment', { symbol, days });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    await new Promise(resolve => setTimeout(resolve, 600));
    
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

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async getPredictionData(symbol: string): Promise<PredictionData[]> {
    const cacheKey = this.getCacheKey('prediction', { symbol });
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    
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

    this.cache.set(cacheKey, { data, timestamp: Date.now() });
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
}

export const stockApi = new StockApiService();