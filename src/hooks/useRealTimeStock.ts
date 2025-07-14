import { useState, useEffect, useCallback, useRef } from 'react';
import { realTimeStockApi } from '../services/realTimeApi';
import { StockData } from '../types/stock';

interface RealTimeStockHook {
  data: StockData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isConnected: boolean;
  refresh: () => void;
}

export function useRealTimeStock(symbol: string | undefined): RealTimeStockHook {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      const stockData = await realTimeStockApi.getStockData(symbol);
      setData(stockData);
      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Setup real-time updates
  useEffect(() => {
    if (!symbol) {
      setData(null);
      setIsConnected(false);
      return;
    }

    // Initial fetch
    fetchData();

    // Setup WebSocket subscription for real-time updates
    const unsubscribe = realTimeStockApi.subscribeToRealTime(symbol, (realTimeData) => {
      setData(prevData => {
        if (!prevData) return prevData;
        
        return {
          ...prevData,
          price: realTimeData.price || prevData.price,
          change: realTimeData.price ? realTimeData.price - prevData.previousClose : prevData.change,
          changePercent: realTimeData.price ? 
            ((realTimeData.price - prevData.previousClose) / prevData.previousClose) * 100 : 
            prevData.changePercent,
          volume: realTimeData.volume || prevData.volume
        };
      });
      setLastUpdate(new Date());
      setIsConnected(true);
    });

    unsubscribeRef.current = unsubscribe;

    // Setup periodic refresh as fallback (every 30 seconds)
    const updateInterval = parseInt(import.meta.env.VITE_UPDATE_INTERVAL || '30000');
    intervalRef.current = setInterval(fetchData, updateInterval);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [symbol, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdate,
    isConnected,
    refresh
  };
}