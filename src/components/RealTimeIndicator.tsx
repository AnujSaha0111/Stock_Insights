import React from 'react';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';

interface RealTimeIndicatorProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  onRefresh: () => void;
  loading?: boolean;
}

export function RealTimeIndicator({ 
  isConnected, 
  lastUpdate, 
  onRefresh, 
  loading = false 
}: RealTimeIndicatorProps) {
  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <Wifi className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Live</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600 dark:text-red-400">
            <WifiOff className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Offline</span>
          </div>
        )}
        
        {/* Live indicator dot */}
        {isConnected && (
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      {/* Last Update */}
      <div className="flex items-center text-gray-600 dark:text-gray-400">
        <Clock className="w-4 h-4 mr-1" />
        <span className="text-sm">
          {formatLastUpdate(lastUpdate)}
        </span>
      </div>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Refresh data"
      >
        <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
}