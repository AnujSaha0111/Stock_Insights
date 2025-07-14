import { Company } from '../types/stock';

export const POPULAR_COMPANIES: Company[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services' },
  { symbol: 'BABA', name: 'Alibaba Group Holding Limited', sector: 'Consumer Discretionary' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
  { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Financial Services' },
  { symbol: 'PG', name: 'Procter & Gamble Company', sector: 'Consumer Staples' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', sector: 'Healthcare' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Discretionary' },
  { symbol: 'BAC', name: 'Bank of America Corporation', sector: 'Financial Services' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
  { symbol: 'DIS', name: 'Walt Disney Company', sector: 'Communication Services' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financial Services' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare' },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare' },
  { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Staples' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare' },
  { symbol: 'ACN', name: 'Accenture plc', sector: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology' },
  { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare' },
  { symbol: 'TXN', name: 'Texas Instruments Incorporated', sector: 'Technology' },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare' },
  { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financial Services' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare' },
  { symbol: 'KO', name: 'Coca-Cola Company', sector: 'Consumer Staples' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples' },
  { symbol: 'LIN', name: 'Linde plc', sector: 'Materials' },
  { symbol: 'MDT', name: 'Medtronic plc', sector: 'Healthcare' },
  { symbol: 'IBM', name: 'International Business Machines Corporation', sector: 'Technology' }
];

export const getCompanyBySymbol = (symbol: string): Company | undefined => {
  return POPULAR_COMPANIES.find(company => 
    company.symbol.toLowerCase() === symbol.toLowerCase()
  );
};

export const searchCompanies = (query: string): Company[] => {
  const searchTerm = query.toLowerCase();
  return POPULAR_COMPANIES.filter(company =>
    company.name.toLowerCase().includes(searchTerm) ||
    company.symbol.toLowerCase().includes(searchTerm)
  );
};