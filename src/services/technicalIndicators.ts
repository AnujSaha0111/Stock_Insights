import { HistoricalData, TechnicalIndicator } from '../types/stock';

export class TechnicalAnalysis {
  static calculateRSI(data: HistoricalData[], period: number = 14): number[] {
    if (data.length < period + 1) return [];
    
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate initial gains and losses
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Calculate RSI
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    
    return rsi;
  }
  
  static calculateMACD(data: HistoricalData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    if (data.length < slowPeriod) return { macd: [], signal: [], histogram: [] };
    
    const ema12 = this.calculateEMA(data.map(d => d.close), fastPeriod);
    const ema26 = this.calculateEMA(data.map(d => d.close), slowPeriod);
    
    const macd: number[] = [];
    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macd.push(ema12[i] - ema26[i]);
    }
    
    const signal = this.calculateEMA(macd, signalPeriod);
    const histogram: number[] = [];
    
    for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
      histogram.push(macd[i] - signal[i]);
    }
    
    return { macd, signal, histogram };
  }
  
  static calculateBollingerBands(data: HistoricalData[], period: number = 20, stdDev: number = 2) {
    if (data.length < period) return { upper: [], lower: [], sma: [] };
    
    const sma: number[] = [];
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, d) => sum + d.close, 0) / period;
      const variance = slice.reduce((sum, d) => sum + Math.pow(d.close - avg, 2), 0) / period;
      const std = Math.sqrt(variance);
      
      sma.push(avg);
      upper.push(avg + (std * stdDev));
      lower.push(avg - (std * stdDev));
    }
    
    return { upper, lower, sma };
  }
  
  private static calculateEMA(data: number[], period: number): number[] {
    if (data.length < period) return [];
    
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
    }
    ema.push(sum / period);
    
    // Calculate subsequent EMAs
    for (let i = period; i < data.length; i++) {
      ema.push((data[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier)));
    }
    
    return ema;
  }
  
  static calculateIndicators(data: HistoricalData[]): TechnicalIndicator[] {
    const rsi = this.calculateRSI(data);
    const macd = this.calculateMACD(data);
    const bollinger = this.calculateBollingerBands(data);
    
    const indicators: TechnicalIndicator[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const indicator: TechnicalIndicator = {
        date: data[i].date
      };
      
      if (i >= data.length - rsi.length) {
        indicator.rsi = rsi[i - (data.length - rsi.length)];
      }
      
      if (i >= data.length - macd.macd.length) {
        const macdIndex = i - (data.length - macd.macd.length);
        indicator.macd = macd.macd[macdIndex];
        if (macdIndex < macd.signal.length) {
          indicator.signal = macd.signal[macdIndex];
          indicator.histogram = macd.histogram[macdIndex];
        }
      }
      
      if (i >= data.length - bollinger.sma.length) {
        const bollingerIndex = i - (data.length - bollinger.sma.length);
        indicator.sma = bollinger.sma[bollingerIndex];
        indicator.upperBand = bollinger.upper[bollingerIndex];
        indicator.lowerBand = bollinger.lower[bollingerIndex];
      }
      
      indicators.push(indicator);
    }
    
    return indicators;
  }
}