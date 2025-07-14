import { useState, useEffect, useCallback } from 'react';
import { realTimeStockApi } from '../services/realTimeApi';
import { HistoricalData, SentimentData, PredictionData, TimeRange } from '../types/stock';

interface RealTimeDataHook {
  historicalData: HistoricalData[];
  sentimentData: SentimentData[];
  predictionData: PredictionData[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refresh: () => void;
}

export function useRealTimeData(
  symbol: string | undefined,
  timeRange: TimeRange
): RealTimeDataHook {
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const [historical, sentiment, prediction] = await Promise.all([
        realTimeStockApi.getHistoricalData(symbol, timeRange),
        realTimeStockApi.getSentimentData(symbol),
        realTimeStockApi.getPredictionData(symbol)
      ]);

      setHistoricalData(historical);
      setSentimentData(sentiment);
      setPredictionData(prediction);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [symbol, timeRange]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes for historical data
  useEffect(() => {
    if (!symbol) return;

    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [symbol, fetchData]);

  return {
    historicalData,
    sentimentData,
    predictionData,
    loading,
    error,
    lastUpdate,
    refresh
  };
}