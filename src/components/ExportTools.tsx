import React from 'react';
import { Download, Share2, FileText, Image } from 'lucide-react';
import { StockData, HistoricalData } from '../types/stock';

interface ExportToolsProps {
  stockData?: StockData;
  historicalData?: HistoricalData[];
  selectedCompany?: string;
}

export function ExportTools({ stockData, historicalData, selectedCompany }: ExportToolsProps) {
  const exportToCSV = () => {
    if (!historicalData || historicalData.length === 0) return;

    const headers = ['Date', 'Open', 'High', 'Low', 'Close', 'Volume'];
    const csvContent = [
      headers.join(','),
      ...historicalData.map(row => [
        row.date,
        row.open,
        row.high,
        row.low,
        row.close,
        row.volume
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCompany || 'stock'}_data.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportChart = () => {
    // In a real implementation, you would capture the chart as an image
    // For now, we'll create a simple data URL
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;
    
    // Simple chart representation
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`${selectedCompany || 'Stock'} Chart Export`, 50, 50);
    
    if (stockData) {
      ctx.font = '16px Arial';
      ctx.fillText(`Current Price: $${stockData.price.toFixed(2)}`, 50, 100);
      ctx.fillText(`Change: ${stockData.change >= 0 ? '+' : ''}$${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)`, 50, 130);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCompany || 'stock'}_chart.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  const generateReport = () => {
    if (!stockData) return;

    const reportContent = `
Stock Analysis Report
=====================

Company: ${stockData.name} (${stockData.symbol})
Date: ${new Date().toLocaleDateString()}

Current Metrics:
- Price: $${stockData.price.toFixed(2)}
- Daily Change: ${stockData.change >= 0 ? '+' : ''}$${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)
- Volume: ${stockData.volume.toLocaleString()}
- Market Cap: $${stockData.marketCap.toLocaleString()}

Daily Range:
- High: $${stockData.high.toFixed(2)}
- Low: $${stockData.low.toFixed(2)}
- Open: $${stockData.open.toFixed(2)}
- Previous Close: $${stockData.previousClose.toFixed(2)}

Historical Data Points: ${historicalData?.length || 0}

Disclaimer: This report is for informational purposes only and should not be considered as investment advice.
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCompany || 'stock'}_report.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shareToSocial = async () => {
    if (!stockData) return;

    const text = `${stockData.name} (${stockData.symbol}) is trading at $${stockData.price.toFixed(2)}, ${stockData.change >= 0 ? 'up' : 'down'} ${Math.abs(stockData.changePercent).toFixed(2)}% today. #StockMarket #Investing`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${stockData.name} Stock Update`,
          text: text,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to Twitter if sharing fails or is denied
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank');
      }
    } else {
      // Fallback to Twitter if navigator.share is not available
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Export & Share
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={exportToCSV}
          disabled={!historicalData || historicalData.length === 0}
          className="flex flex-col items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Export data to CSV"
        >
          <Download className="w-5 h-5 text-blue-600 mb-1" />
          <span className="text-xs text-gray-700 dark:text-gray-300">CSV Data</span>
        </button>

        <button
          onClick={exportChart}
          className="flex flex-col items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Export chart as image"
        >
          <Image className="w-5 h-5 text-green-600 mb-1" />
          <span className="text-xs text-gray-700 dark:text-gray-300">Chart PNG</span>
        </button>

        <button
          onClick={generateReport}
          disabled={!stockData}
          className="flex flex-col items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Generate text report"
        >
          <FileText className="w-5 h-5 text-purple-600 mb-1" />
          <span className="text-xs text-gray-700 dark:text-gray-300">Report</span>
        </button>

        <button
          onClick={shareToSocial}
          disabled={!stockData}
          className="flex flex-col items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Share to social media"
        >
          <Share2 className="w-5 h-5 text-orange-600 mb-1" />
          <span className="text-xs text-gray-700 dark:text-gray-300">Share</span>
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        Export your analysis data or share insights on social media
      </div>
    </div>
  );
}