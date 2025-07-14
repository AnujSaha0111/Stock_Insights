import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Bar
} from 'recharts';
import { HistoricalData, TechnicalIndicator, ChartType } from '../types/stock';
import { format } from 'date-fns';

interface StockChartProps {
  data: HistoricalData[];
  indicators?: TechnicalIndicator[];
  chartType: ChartType;
  showIndicators: {
    rsi: boolean;
    macd: boolean;
    bollinger: boolean;
  };
}

export function StockChart({ data, indicators, chartType, showIndicators }: StockChartProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const indicator = indicators?.[index];
      return {
        ...item,
        date: format(new Date(item.date), 'MMM dd'),
        ...indicator
      };
    });
  }, [data, indicators]);

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name === 'volume' ? formatVolume(entry.value) : formatPrice(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderMainChart = () => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={formatPrice}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            {showIndicators.bollinger && (
              <>
                <Line
                  type="monotone"
                  dataKey="upperBand"
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lowerBand"
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sma"
                  stroke="#F59E0B"
                  strokeWidth={1}
                  dot={false}
                />
              </>
            )}
          </AreaChart>
        );
      
      case 'candlestick':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={formatPrice}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="volume"
              fill="#6B7280"
              opacity={0.3}
              yAxisId="volume"
            />
            <Line
              type="monotone"
              dataKey="high"
              stroke="#10B981"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#EF4444"
              strokeWidth={1}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        );
      
      default:
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={formatPrice}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6' }}
            />
            {showIndicators.bollinger && (
              <>
                <Line
                  type="monotone"
                  dataKey="upperBand"
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="lowerBand"
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sma"
                  stroke="#F59E0B"
                  strokeWidth={1}
                  dot={false}
                />
              </>
            )}
          </LineChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Price Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {renderMainChart()}
        </ResponsiveContainer>
      </div>

      {/* RSI Chart */}
      {showIndicators.rsi && (
        <div className="h-32">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            RSI (Relative Strength Index)
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={10}
              />
              <YAxis 
                domain={[0, 100]}
                stroke="#6B7280"
                fontSize={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
              />
              {/* Overbought/Oversold lines */}
              <Line
                type="monotone"
                dataKey={() => 70}
                stroke="#EF4444"
                strokeDasharray="3 3"
                strokeWidth={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={() => 30}
                stroke="#10B981"
                strokeDasharray="3 3"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD Chart */}
      {showIndicators.macd && (
        <div className="h-32">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            MACD
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={10}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="histogram"
                fill="#6B7280"
                opacity={0.6}
              />
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}