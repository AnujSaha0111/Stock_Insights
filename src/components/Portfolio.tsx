import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PortfolioStock, Company } from '../types/stock';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CompanySearch } from './CompanySearch';
import { Card } from './ui/Card';

export function Portfolio() {
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioStock[]>('portfolio', []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const addToPortfolio = () => {
    if (!selectedCompany || !shares || !purchasePrice) return;

    const newStock: PortfolioStock = {
      symbol: selectedCompany.symbol,
      name: selectedCompany.name,
      shares: parseFloat(shares),
      purchasePrice: parseFloat(purchasePrice),
      currentPrice: parseFloat(purchasePrice) * (1 + (Math.random() - 0.5) * 0.2), // Mock current price
      totalValue: 0,
      gainLoss: 0,
      gainLossPercent: 0
    };

    newStock.totalValue = newStock.shares * newStock.currentPrice;
    newStock.gainLoss = newStock.totalValue - (newStock.shares * newStock.purchasePrice);
    newStock.gainLossPercent = (newStock.gainLoss / (newStock.shares * newStock.purchasePrice)) * 100;

    setPortfolio([...portfolio, newStock]);
    setShowAddForm(false);
    setSelectedCompany(undefined);
    setShares('');
    setPurchasePrice('');
  };

  const removeFromPortfolio = (symbol: string) => {
    setPortfolio(portfolio.filter(stock => stock.symbol !== symbol));
  };

  const totalValue = portfolio.reduce((sum, stock) => sum + stock.totalValue, 0);
  const totalGainLoss = portfolio.reduce((sum, stock) => sum + stock.gainLoss, 0);
  const totalGainLossPercent = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <Card title="Portfolio Tracker">
      <div className="space-y-6">
        {/* Portfolio Summary */}
        {portfolio.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalValue)}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Value</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalGainLoss)}
              </div>
              <div className={`text-sm ${totalGainLoss >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                Total Gain/Loss
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
              </div>
              <div className={`text-sm ${totalGainLossPercent >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                Total Return
              </div>
            </div>
          </div>
        )}

        {/* Add Stock Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Holdings ({portfolio.length})
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </button>
        </div>

        {/* Add Stock Form */}
        {showAddForm && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
            <CompanySearch
              onSelect={setSelectedCompany}
              selectedCompany={selectedCompany}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shares" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Shares
                </label>
                <input
                  id="shares"
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="purchase-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Price
                </label>
                <input
                  id="purchase-price"
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="150.00"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addToPortfolio}
                disabled={!selectedCompany || !shares || !purchasePrice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add to Portfolio
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Holdings */}
        {portfolio.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No stocks in your portfolio yet.</p>
            <p className="text-sm mt-1">Add some stocks to start tracking your investments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {portfolio.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {stock.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stock.symbol} • {stock.shares} shares
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right mr-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(stock.totalValue)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(stock.currentPrice)} per share
                  </div>
                </div>
                
                <div className="text-right mr-4">
                  <div className={`flex items-center ${stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.gainLoss >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    <span className="font-medium">
                      {formatCurrency(Math.abs(stock.gainLoss))}
                    </span>
                  </div>
                  <div className={`text-sm ${stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.gainLoss >= 0 ? '+' : ''}{stock.gainLossPercent.toFixed(2)}%
                  </div>
                </div>
                
                <button
                  onClick={() => removeFromPortfolio(stock.symbol)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${stock.name} from portfolio`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}