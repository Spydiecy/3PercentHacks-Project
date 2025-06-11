import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import crypto from 'crypto';
import querystring from 'querystring';

// Define API credentials interface and configuration
interface ApiConfig {
  api_key: string;
  secret_key: string;
  passphrase: string;
  project: string;
}

const api_config: ApiConfig = {
  api_key: process.env.API_KEY!,
  secret_key: process.env.SECRET_KEY!,
  passphrase: process.env.PASSPHRASE!,
  project: process.env.PROJECT_ID!,
};

// Request query parameters interface
interface TotalValueQuery {
  address: string;
  chains?: string;
  assetType?: '0' | '1' | '2';
  excludeRiskToken?: string; // will parse to boolean
}

// Response data interfaces based on OKX docs
interface TotalValueData {
  totalValue: string;
}

interface OkxApiResponse {
  code: string;
  msg: string;
  data: TotalValueData[];
}

// Helper to create the preHash string for signature
function preHash(timestamp: string, method: string, request_path: string, params?: Record<string, any>): string {
  let query_string = '';
  if (method === 'GET' && params) {
    query_string = '?' + querystring.stringify(params);
  }
  if (method === 'POST' && params) {
    query_string = JSON.stringify(params);
  }
  return timestamp + method + request_path + query_string;
}

// Helper to sign the preHash string using HMAC-SHA256 and base64 encode
function sign(message: string, secret_key: string): string {
  const hmac = crypto.createHmac('sha256', secret_key);
  hmac.update(message);
  return hmac.digest('base64');
}

// Create signature and timestamp headers
function createSignature(method: string, request_path: string, params?: Record<string, any>) {
  const timestamp = new Date().toISOString().slice(0, -5) + 'Z';
  const message = preHash(timestamp, method, request_path, params);
  const signature = sign(message, api_config.secret_key);
  return { signature, timestamp };
}

export  async function POST(req:any, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed, use POST' });
  }

  // Parse JSON body
  const { address, chains, assetType, excludeRiskToken } = await req.json();

  if (!address) {
    return Response.json({ error: 'Missing required parameter: address' });
  }

  // Prepare params for OKX API
  const params: Record<string, any> = { accountId:address,chains };

  if (chains) params.chains = chains;
  if (assetType) params.assetType = assetType;
  if (excludeRiskToken !== undefined) params.excludeRiskToken = excludeRiskToken;

  const request_path = '/api/v5/dex/balance/total-value';

  // Generate signature and timestamp
  const { signature, timestamp } = createSignature('GET', request_path, params);

  // Prepare headers
  const headers = {
    'OK-ACCESS-KEY': api_config.api_key,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': api_config.passphrase,
    'OK-ACCESS-PROJECT': api_config.project,
    'Content-Type': 'application/json',
  };

  // Build the full path with query string
  const fullPath = request_path + '?' + querystring.stringify(params);

  const options = {
    hostname: 'web3.okx.com',
    path: fullPath,
    method: 'GET',
    headers,
  };

  try {
    const data = await new Promise<OkxApiResponse>((resolve, reject) => {
      const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          try {
            const json = JSON.parse(body) as OkxApiResponse;
            resolve(json);
          } catch (error) {
            reject(new Error('Failed to parse JSON response'));
          }
        });
      });

      request.on('error', (err) => reject(err));
      request.end();
    });

    return Response.json(data);
  } catch (error: any) {
   return  Response.json({ error: error.message || 'Internal Server Error' });
  }
}
