import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface ApiStatusProps {
  className?: string;
}

export function ApiStatus({ className = '' }: ApiStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    provider: import.meta.env.VITE_API_PROVIDER || 'mock',
    alphaVantage: !!import.meta.env.VITE_ALPHA_VANTAGE_API_KEY,
    finnhub: !!import.meta.env.VITE_FINNHUB_API_KEY,
    polygon: !!import.meta.env.VITE_POLYGON_API_KEY,
    websocket: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true'
  });

  const getStatusIcon = (hasKey: boolean) => {
    if (hasKey) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getProviderStatus = () => {
    switch (apiStatus.provider) {
      case 'alphavantage':
        return apiStatus.alphaVantage ? 'Connected' : 'API Key Missing';
      case 'finnhub':
        return apiStatus.finnhub ? 'Connected' : 'API Key Missing';
      case 'polygon':
        return apiStatus.polygon ? 'Connected' : 'API Key Missing';
      default:
        return 'Mock Data';
    }
  };

  const getProviderColor = () => {
    if (apiStatus.provider === 'mock') return 'text-yellow-600';
    
    const hasKey = apiStatus.provider === 'alphavantage' ? apiStatus.alphaVantage :
                   apiStatus.provider === 'finnhub' ? apiStatus.finnhub :
                   apiStatus.provider === 'polygon' ? apiStatus.polygon : false;
    
    return hasKey ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        aria-label="API Status"
      >
        <Settings className="w-4 h-4 mr-2" />
        <span className={getProviderColor()}>
          {getProviderStatus()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              API Configuration
            </h3>

            {/* Current Provider */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Provider:
                </span>
                <span className={`text-sm font-bold ${getProviderColor()}`}>
                  {apiStatus.provider.toUpperCase()}
                </span>
              </div>
            </div>

            {/* API Keys Status */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Alpha Vantage</span>
                {getStatusIcon(apiStatus.alphaVantage)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Finnhub</span>
                {getStatusIcon(apiStatus.finnhub)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Polygon</span>
                {getStatusIcon(apiStatus.polygon)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">WebSocket</span>
                {getStatusIcon(apiStatus.websocket)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}