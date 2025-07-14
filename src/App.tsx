import React, { useState, useEffect } from 'react';
import { Moon, Sun, BarChart3, TrendingUp, Brain, PieChart, Download } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useRealTimeStock } from './hooks/useRealTimeStock';
import { useRealTimeData } from './hooks/useRealTimeData';
import { TechnicalAnalysis } from './services/technicalIndicators';
import { CompanySearch } from './components/CompanySearch';
import { StockChart } from './components/StockChart';
import { StockMetrics } from './components/StockMetrics';
import { SentimentChart } from './components/SentimentChart';
import { PredictionChart } from './components/PredictionChart';
import { Portfolio } from './components/Portfolio';
import { ExportTools } from './components/ExportTools';
import { RealTimeIndicator } from './components/RealTimeIndicator';
import { ApiStatus } from './components/ApiStatus';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';
import { 
  TechnicalIndicator, 
  Company, 
  ChartType, 
  TimeRange 
} from './types/stock';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCompany, setSelectedCompany] = useState<Company>();
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment' | 'prediction' | 'portfolio'>('overview');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [showIndicators, setShowIndicators] = useState({
    rsi: false,
    macd: false,
    bollinger: false
  });

  // Real-time hooks
  const {
    data: stockData,
    loading: stockLoading,
    error: stockError,
    lastUpdate,
    isConnected,
    refresh: refreshStock
  } = useRealTimeStock(selectedCompany?.symbol);

  const {
    historicalData,
    sentimentData,
    predictionData,
    loading: dataLoading,
    error: dataError,
    refresh: refreshData
  } = useRealTimeData(selectedCompany?.symbol, timeRange);

  const loading = stockLoading || dataLoading;
  const error = stockError || dataError;

  useEffect(() => {
    if (historicalData.length > 0) {
      const technicalIndicators = TechnicalAnalysis.calculateIndicators(historicalData);
      setIndicators(technicalIndicators);
    }
  }, [historicalData]);

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleRetry = () => {
    refreshStock();
    refreshData();
  };

  const handleRefresh = () => {
    refreshStock();
    refreshData();
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'sentiment' as const, label: 'Sentiment', icon: TrendingUp },
    { id: 'prediction' as const, label: 'Prediction', icon: Brain },
    { id: 'portfolio' as const, label: 'Portfolio', icon: PieChart }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Stock Insights
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ApiStatus />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <CompanySearch
                onSelect={handleCompanySelect}
                selectedCompany={selectedCompany}
              />
            </div>

            {/* Controls */}
            {selectedCompany && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Chart Settings
                </h3>
                
                {/* Time Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Range
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="1D">1 Day</option>
                    <option value="1W">1 Week</option>
                    <option value="1M">1 Month</option>
                    <option value="3M">3 Months</option>
                    <option value="6M">6 Months</option>
                    <option value="1Y">1 Year</option>
                    <option value="2Y">2 Years</option>
                  </select>
                </div>

                {/* Chart Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Chart Type
                  </label>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value as ChartType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="candlestick">Candlestick</option>
                  </select>
                </div>

                {/* Technical Indicators */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technical Indicators
                  </label>
                  <div className="space-y-2">
                    {Object.entries(showIndicators).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setShowIndicators(prev => ({
                            ...prev,
                            [key]: e.target.checked
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {key === 'rsi' ? 'RSI' : key === 'macd' ? 'MACD' : 'Bollinger Bands'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Export Tools */}
            {selectedCompany && stockData && (
              <ExportTools
                stockData={stockData}
                historicalData={historicalData}
                selectedCompany={selectedCompany.name}
              />
            )}

            {/* Real-time Status */}
            {selectedCompany && (
              <RealTimeIndicator
                isConnected={isConnected}
                lastUpdate={lastUpdate}
                onRefresh={handleRefresh}
                loading={loading}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Navigation Tabs */}
            <div className="mb-6">
              <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-gray-600 dark:text-gray-400">
                    Loading stock data...
                  </span>
                </div>
              )}

              {error && (
                <ErrorMessage message={error} onRetry={handleRetry} />
              )}

              {!loading && !error && !selectedCompany && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Welcome to Stock Analytics Pro
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a company from the sidebar to start analyzing stock data with advanced features including sentiment analysis, AI predictions, and portfolio tracking.
                  </p>
                </div>
              )}

              {!loading && !error && selectedCompany && stockData && (
                <>
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <StockMetrics data={stockData} />
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Price Chart
                        </h3>
                        <StockChart
                          data={historicalData}
                          indicators={indicators}
                          chartType={chartType}
                          showIndicators={showIndicators}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'sentiment' && (
                    <SentimentChart data={sentimentData} />
                  )}

                  {activeTab === 'prediction' && (
                    <PredictionChart
                      historicalData={historicalData}
                      predictionData={predictionData}
                    />
                  )}

                  {activeTab === 'portfolio' && (
                    <Portfolio />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;