export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  date: string;
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
  upperBand?: number;
  lowerBand?: number;
  sma?: number;
}

export interface SentimentData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  score: number;
}

export interface PortfolioStock {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface Company {
  symbol: string;
  name: string;
  sector: string;
}

export interface PredictionData {
  date: string;
  predicted: number;
  confidence: number;
}

export type ChartType = 'line' | 'candlestick' | 'area';
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '2Y';
export type Theme = 'light' | 'dark';