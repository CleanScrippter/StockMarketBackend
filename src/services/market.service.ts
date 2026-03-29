import axios from 'axios';
import { config } from '../config';

const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';

export const fetchMarketData = async (symbol: string) => {
  // Auto-append .BSE for Indian markets if no exchange suffix is provided
  const formattedSymbol = symbol.includes('.') ? symbol : `${symbol}.BSE`;

  // Fetch daily time series for market ticks
  const tsResponse = await axios.get(ALPHA_VANTAGE_BASE, {
    params: {
      function: 'GLOBAL_QUOTE',
      symbol: formattedSymbol,
      apikey: config.ALPHAVANTAGE_API_KEY
    }
  });

  const quote = tsResponse.data['Global Quote'];
  if (!quote || Object.keys(quote).length === 0) {
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }

  // Parse AlphaVantage response
  const price = parseFloat(quote['05. price']);
  const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
  const high = parseFloat(quote['03. high']);
  const low = parseFloat(quote['04. low']);
  const volume = parseFloat(quote['06. volume']);

  return {
    price,
    changePercent,
    high,
    low,
    volume
  };
};
