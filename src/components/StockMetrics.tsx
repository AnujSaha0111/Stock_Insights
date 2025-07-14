import React from 'react';
import { TrendingUp, TrendingDown, Volume, DollarSign } from 'lucide-react';
import { StockData } from '../types/stock';
import { Card } from './ui/Card';

interface StockMetricsProps {
  data: StockData;
}

export function StockMetrics({ data }: StockMetricsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  };

  const isPositive = data.change >= 0;

  return (
    <Card title={`${data.name} (${data.symbol})`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Price */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5 text-blue-500 mr-1" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Current Price
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${data.price.toFixed(2)}
          </div>
        </div>

        {/* Daily Change */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500 mr-1" />
            )}
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Daily Change
            </span>
          </div>
          <div className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}${data.change.toFixed(2)}
          </div>
          <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            ({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)
          </div>
        </div>

        {/* Volume */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Volume className="w-5 h-5 text-purple-500 mr-1" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Volume
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatVolume(data.volume)}
          </div>
        </div>

        {/* Market Cap */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5 text-orange-500 mr-1" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Market Cap
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatNumber(data.marketCap)}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Open:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              ${data.open.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">High:</span>
            <span className="ml-2 font-medium text-green-600">
              ${data.high.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Low:</span>
            <span className="ml-2 font-medium text-red-600">
              ${data.low.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Prev Close:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              ${data.previousClose.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}