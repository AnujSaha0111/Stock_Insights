# Stock Insights

A modern React/TypeScript application for visualizing and analyzing stock market data. This project provides real-time updates, advanced analytics, sentiment analysis, and portfolio tracking, all in a user-friendly interface.

## About

This project was created to help users track and analyze stock market trends, manage a portfolio, and explore technical indicators. It is designed for both casual investors and those interested in financial data visualization.

## Features

### 🚀 Core Features
- **Real-time Stock Data**: Live price updates via WebSocket connections and API polling
- **Multiple API Support**: Alpha Vantage, Finnhub, Polygon.io with automatic fallback
- **Interactive Charts**: Multiple chart types (line, area, candlestick) with zoom and pan capabilities
- **Company Search**: Search and select from 50+ popular companies with autocomplete
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with system preference detection

### 🔴 Real-Time Features
- **Live Price Streaming**: WebSocket connections for instant price updates
- **Automatic Refresh**: Configurable polling intervals (default: 30 seconds)
- **Connection Status**: Visual indicators for live/offline status
- **Rate Limiting**: Smart API usage with caching and fallback mechanisms
- **Multi-Provider Support**: Seamless switching between data providers

### 📊 Advanced Analytics
- **Technical Indicators**: RSI, MACD, Bollinger Bands with toggleable overlays
- **Sentiment Analysis**: Market sentiment tracking from news and social media
- **Statistical Forecasts**: Price forecasts based on historical data and statistical models
- **Historical Data**: Customizable time ranges (1D to 2Y)

### 💼 Portfolio Management
- **Portfolio Tracking**: Add/remove stocks, track performance
- **Performance Metrics**: Total value, gain/loss, percentage returns
- **Local Storage**: Persistent portfolio data across sessions

### 🔧 Export & Sharing
- **Data Export**: CSV export for historical data
- **Chart Export**: PNG image export of charts
- **Report Generation**: Text-based analysis reports
- **Social Sharing**: Share insights on social media platforms

### ♿ Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **High Contrast**: Accessible color schemes
- **Focus Management**: Clear focus indicators

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Real-time Data**: WebSocket + REST APIs with intelligent caching
- **APIs**: Alpha Vantage, Finnhub, Polygon.io support

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/<your-username>/stock-insights.git
cd stock-insights
```

2. Install dependencies:
```bash
npm install
```

3. **Configure APIs (Optional for Real-time Data)**:

Create a `.env` file in the project root with the following content:

```env
VITE_FINNHUB_API_KEY=your_finnhub_key_here
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
VITE_POLYGON_API_KEY=your_polygon_key_here

VITE_API_PROVIDER=your_api_provider(finnhub/alpha_vantage/polygon)

VITE_ENABLE_WEBSOCKET=true
VITE_UPDATE_INTERVAL=30000
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Real-Time Configuration

### API Providers

The application supports multiple real-time data providers:

#### 1. **Finnhub** (Recommended)
- **Free Tier**: 60 calls/minute
- **WebSocket**: Real-time price streaming
- **Setup**: Get free API key at [finnhub.io](https://finnhub.io/register)

#### 2. **Alpha Vantage**
- **Free Tier**: 5 calls/minute, 500/day
- **Features**: Comprehensive historical data
- **Setup**: Get free API key at [alphavantage.co](https://www.alphavantage.co/support/#api-key)

#### 3. **Polygon.io**
- **Free Tier**: 5 calls/minute
- **Features**: High-quality financial data
- **Setup**: Get API key at [polygon.io](https://polygon.io/)

### Environment Variables

```bash
# API Configuration
VITE_API_PROVIDER=finnhub          # Primary data provider
VITE_FINNHUB_API_KEY=your_key      # Finnhub API key
VITE_ALPHA_VANTAGE_API_KEY=your_key # Alpha Vantage API key
VITE_POLYGON_API_KEY=your_key       # Polygon API key

# Real-time Settings
VITE_ENABLE_WEBSOCKET=true          # Enable WebSocket streaming
VITE_UPDATE_INTERVAL=30000          # Polling interval (ms)
```

### Mock Data Mode

Without API keys, the application runs in **mock mode** with:
- Realistic simulated price movements
- All features fully functional
- No external API dependencies
- Perfect for development and testing

## Usage

### Basic Usage
1. **Select a Company**: Use the search dropdown to find and select a company
2. **View Metrics**: See real-time price, change, volume, and market cap
3. **Analyze Charts**: Switch between chart types and time ranges
4. **Add Indicators**: Toggle technical indicators on/off

### Real-Time Features
1. **Monitor Connection**: Check the live/offline indicator in the sidebar
2. **View Last Update**: See when data was last refreshed
3. **Manual Refresh**: Click the refresh button for instant updates
4. **API Status**: Click the settings icon to view API configuration

### Advanced Features
1. **Sentiment Analysis**: Switch to the Sentiment tab to view market sentiment
2. **Price Predictions**: View 5-day price predictions in the Prediction tab
3. **Portfolio Tracking**: Add stocks to your portfolio in the Portfolio tab
4. **Export Data**: Use the export tools to download data or share insights

### Keyboard Shortcuts
- `Tab`: Navigate between interactive elements
- `Enter`: Select highlighted option in dropdowns
- `Escape`: Close open dropdowns or modals
- `Space`: Toggle checkboxes and buttons

## API Integration

### Current Implementation

The application includes a comprehensive real-time API service with:

- **Multi-provider support** with automatic fallback
- **WebSocket streaming** for real-time price updates
- **Intelligent caching** to minimize API usage
- **Rate limiting** to respect API quotas
- **Error handling** with graceful degradation

### Adding New Providers

To add a new API provider:

1. **Extend the RealTimeStockApi class** in `src/services/realTimeApi.ts`
2. **Add provider-specific methods** for data fetching
3. **Update environment configuration**
4. **Test with rate limiting and error handling**

## Customization

### Adding New Companies
Edit `src/data/companies.ts` to add more companies to the search dropdown.

### Modifying Technical Indicators
Extend `src/services/technicalIndicators.ts` to add new technical analysis calculations.

### Styling
The application uses Tailwind CSS. Modify `tailwind.config.js` for theme customization.

## Performance Optimization

- **Smart Caching**: Automatic caching with configurable TTL
- **Rate Limiting**: Intelligent API usage management
- **WebSocket Pooling**: Efficient real-time connection management
- **Lazy Loading**: Components load only when needed
- **Memoization**: React.memo and useMemo for expensive calculations
- **Debounced Search**: Search input is debounced to reduce API calls
- **Connection Management**: Automatic reconnection and cleanup

## Real-Time Architecture

### Data Flow
1. **WebSocket Connection**: Establishes real-time price streaming
2. **Polling Fallback**: Regular API calls for data refresh
3. **Cache Layer**: Reduces API calls and improves performance
4. **State Management**: React hooks for real-time state updates
5. **Error Handling**: Graceful fallback to mock data

### Connection Management
- **Automatic Reconnection**: WebSocket reconnects on disconnect
- **Subscription Management**: Efficient subscriber pattern
- **Resource Cleanup**: Proper cleanup on component unmount
- **Rate Limiting**: Respects API quotas and limits

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is for educational and informational purposes only. The stock data, predictions, and analysis should not be used as the sole basis for investment decisions. Real-time data may have delays. Always consult with a qualified financial advisor before making investment decisions.

## Support

For support, please open an issue on GitHub or contact the development team.