import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { SentimentData } from '../types/stock';
import { format } from 'date-fns';
import { Card } from './ui/Card';

interface SentimentChartProps {
  data: SentimentData[];
}

export function SentimentChart({ data }: SentimentChartProps) {
  const chartData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'MMM dd'),
    positivePercent: item.positive * 100,
    neutralPercent: item.neutral * 100,
    negativePercent: item.negative * 100
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-green-600';
    if (score < -0.1) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.1) return 'Positive';
    if (score < -0.1) return 'Negative';
    return 'Neutral';
  };

  const averageSentiment = data.reduce((sum, item) => sum + item.score, 0) / data.length;

  return (
    <Card title="Market Sentiment Analysis">
      <div className="space-y-6">
        {/* Sentiment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(data[data.length - 1]?.positive * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Positive</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {(data[data.length - 1]?.neutral * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Neutral</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {(data[data.length - 1]?.negative * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">Negative</div>
          </div>
        </div>

        {/* Overall Sentiment Score */}
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Overall Sentiment
          </div>
          <div className={`text-3xl font-bold ${getSentimentColor(averageSentiment)}`}>
            {getSentimentLabel(averageSentiment)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Score: {averageSentiment.toFixed(3)}
          </div>
        </div>

        {/* Sentiment Trend Chart */}
        <div className="h-64">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Sentiment Trends Over Time
          </h4>
          <ResponsiveContainer width="100%" height="100%">
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
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="positivePercent"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.6}
                name="Positive"
              />
              <Area
                type="monotone"
                dataKey="neutralPercent"
                stackId="1"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.6}
                name="Neutral"
              />
              <Area
                type="monotone"
                dataKey="negativePercent"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
                name="Negative"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Score Line Chart */}
        <div className="h-48">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Sentiment Score Timeline
          </h4>
          <ResponsiveContainer width="100%" height="100%">
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
                domain={[-1, 1]}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const score = payload[0].value as number;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                        <p className={`text-sm ${getSentimentColor(score)}`}>
                          Score: {score.toFixed(3)} ({getSentimentLabel(score)})
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3B82F6' }}
              />
              {/* Zero line */}
              <Line
                type="monotone"
                dataKey={() => 0}
                stroke="#6B7280"
                strokeDasharray="3 3"
                strokeWidth={1}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}