import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { HistoricalData, PredictionData } from '../types/stock';
import { format } from 'date-fns';
import { Card } from './ui/Card';

interface PredictionChartProps {
  historicalData: HistoricalData[];
  predictionData: PredictionData[];
}

export function PredictionChart({ historicalData, predictionData }: PredictionChartProps) {
  // Combine historical and prediction data
  const combinedData = [
    ...historicalData.slice(-30).map(item => ({
      date: format(new Date(item.date), 'MMM dd'),
      actual: item.close,
      predicted: null,
      confidence: null,
      type: 'historical'
    })),
    ...predictionData.map(item => ({
      date: format(new Date(item.date), 'MMM dd'),
      actual: null,
      predicted: item.predicted,
      confidence: item.confidence,
      type: 'prediction'
    }))
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {data.actual && (
            <p className="text-sm text-blue-600">
              Actual: ${data.actual.toFixed(2)}
            </p>
          )}
          {data.predicted && (
            <>
              <p className="text-sm text-orange-600">
                Predicted: ${data.predicted.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                Confidence: {(data.confidence * 100).toFixed(1)}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const currentPrice = historicalData[historicalData.length - 1]?.close || 0;
  const lastPrediction = predictionData[predictionData.length - 1]?.predicted || 0;
  const priceChange = lastPrediction - currentPrice;
  const priceChangePercent = (priceChange / currentPrice) * 100;

  return (
    <Card title="Price Prediction (LSTM Model)">
      <div className="space-y-6">
        {/* Prediction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${currentPrice.toFixed(2)}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Current Price</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              ${lastPrediction.toFixed(2)}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">5-Day Prediction</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}
            </div>
            <div className={`text-sm ${priceChange >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Prediction Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Historical prices */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Actual Price"
              />
              
              {/* Predicted prices */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#F59E0B', r: 3 }}
                connectNulls={false}
                name="Predicted Price"
              />
              
              {/* Reference line at current price */}
              <ReferenceLine 
                y={currentPrice} 
                stroke="#6B7280" 
                strokeDasharray="3 3"
                label={{ value: "Current", position: "top" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Model Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Model Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Algorithm:</span> LSTM Neural Network
            </div>
            <div>
              <span className="font-medium">Training Period:</span> 60 days
            </div>
            <div>
              <span className="font-medium">Prediction Horizon:</span> 5 days
            </div>
            <div>
              <span className="font-medium">Average Confidence:</span>{' '}
              {(predictionData.reduce((sum, item) => sum + item.confidence, 0) / predictionData.length * 100).toFixed(1)}%
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <strong>Note:</strong> This prediction is based on historical data and statistical modeling. It should not be used as the sole basis for investment decisions. Past performance does not guarantee future results.
          </div>
        </div>
      </div>
    </Card>
  );
}