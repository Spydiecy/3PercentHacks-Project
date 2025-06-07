/**
 * Utility file for handling market data API requests
 */

/**
 * Call the market data API to fetch information about a specific token
 * 
 * @param type - The type of information to fetch (price, trades, etc.)
 * @param tokenName - The name of the token to fetch information for
 * @returns Promise containing the market data
 */
export async function callMarketDataApi(type: string, tokenName: string): Promise<any> {
  try {
    // Determine the appropriate endpoint based on the type
    let path = '';
    let method = 'GET';
    let data = {};

    // Map the type to the appropriate OKX API endpoint
    switch (type) {
      case 'price':
        path = '/api/v5/market/ticker';
        data = { instId: `${tokenName}-USDT` };
        break;
      case 'trades':
        path = '/api/v5/market/trades';
        data = { instId: `${tokenName}-USDT` };
        break;
      case 'candlestick':
        path = '/api/v5/market/candles';
        data = { instId: `${tokenName}-USDT`, bar: '1D' };
        break;
      case 'token_index_price':
        path = '/api/v5/market/index-tickers';
        data = { instId: `${tokenName}USDT` };
        break;
      default:
        // For other types, default to ticker data
        path = '/api/v5/market/ticker';
        data = { instId: `${tokenName}-USDT` };
    }

    // Call the market data API endpoint
    const response = await fetch('/api/market_data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method,
        path,
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error fetching market data:', error);
    throw new Error(`Failed to fetch market data: ${error.message}`);
  }
}

/**
 * Formats market data into a human-readable string
 * 
 * @param data - The raw market data
 * @param tokenName - The name of the token
 * @returns A formatted string with relevant market information
 */
export function formatMarketData(data: any, tokenName: string): string {
  if (!data || !data.data || data.data.length === 0) {
    return `No market data available for ${tokenName}`;
  }

  try {
    // Handle different response structures based on data type
    if (data.data[0].last) {
      // Price ticker data
      const ticker = data.data[0];
      return `
Current ${tokenName} Price: $${parseFloat(ticker.last).toFixed(2)}
24h High: $${parseFloat(ticker.high24h).toFixed(2)}
24h Low: $${parseFloat(ticker.low24h).toFixed(2)}
24h Volume: ${parseFloat(ticker.vol24h).toFixed(2)}
24h Change: ${parseFloat(ticker.volCcy24h).toFixed(2)}%
      `.trim();
    } else if (data.data[0].ts) {
      // Trade data
      return `Latest ${tokenName} trades: ${data.data.slice(0, 3).map((trade: any) => 
        `${trade.side.toUpperCase()} at $${parseFloat(trade.px).toFixed(2)}`
      ).join(', ')}`;
    } else {
      // Generic fallback
      return `Market data for ${tokenName}: ${JSON.stringify(data.data[0])}`;
    }
  } catch (error) {
    console.error('Error formatting market data:', error);
    return `Market data available for ${tokenName}, but could not format it: ${JSON.stringify(data)}`;
  }
}
