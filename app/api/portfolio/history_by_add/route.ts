import https from 'https';
import crypto from 'crypto';
import querystring from 'querystring';

interface ApiConfig {
  api_key: string;
  secret_key: string;
  passphrase: string;
  project: string;
}

const api_config: any = {
  api_key: process.env.API_KEY,
  secret_key: process.env.SECRET_KEY,
  passphrase: process.env.PASSPHRASE,
  project: process.env.PROJECT_ID,  // <-- Add your actual Project ID here
};

interface TransactionHistoryRequestBody {
  address: string;
  chains?: string; // comma separated chain IDs, e.g. "1,56"
  tokenContractAddress?: string;
  begin?: string; // unix timestamp in milliseconds as string
  end?: string;   // unix timestamp in milliseconds as string
  cursor?: string;
  limit?: string; // number of records to return
}

interface FromToAddress {
  address: string;
  amount: string;
}

interface Transaction {
  chainIndex: string;
  txHash: string;
  itype: string;
  methodId: string;
  nonce: string;
  txTime: string;
  from: FromToAddress[];
  to: FromToAddress[];
  tokenContractAddress: string;
  amount: string;
  symbol: string;
  txFee: string;
  txStatus: string;
  hitBlacklist: boolean;
}

interface TransactionData {
  cursor: string;
  transactionList: Transaction[];
}

interface OkxApiResponse {
  code: string;
  msg: string;
  data: TransactionData[];
}

// Helper to create preHash string for signature
function preHash(
  timestamp: string,
  method: string,
  request_path: string,
  params?: Record<string, any>
): string {
  let query_string = '';
  if (method === 'GET' && params) {
    query_string = '?' + querystring.stringify(params);
  }
  if (method === 'POST' && params) {
    query_string = JSON.stringify(params);
  }
  return timestamp + method + request_path + query_string;
}

// Helper to sign the preHash string
function sign(message: string, secret_key: string): string {
  const hmac = crypto.createHmac('sha256', secret_key);
  hmac.update(message);
  return hmac.digest('base64');
}

// Create signature and timestamp headers
function createSignature(
  method: string,
  request_path: string,
  params?: Record<string, any>
) {
  const timestamp = new Date().toISOString().slice(0, -5) + 'Z';
  const message = preHash(timestamp, method, request_path, params);
  const signature = sign(message, api_config.secret_key);
  return { signature, timestamp };
}

export  async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed, use POST' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON body
    const body: TransactionHistoryRequestBody = await req.json();

    const {
      address,
      chains,
      tokenContractAddress,
      begin,
      end,
      cursor,
      limit,
    } = body;

    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare query parameters for OKX GET request
    const params: Record<string, any> = {
      address: address, // Note: API param is "addresses" (plural)
    };

    if (chains) params.chains = chains;
    if (tokenContractAddress !== undefined) params.tokenContractAddress = tokenContractAddress;
    if (begin) params.begin = begin;
    if (end) params.end = end;
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;

    const request_path = '/api/v5/dex/post-transaction/transactions-by-address';
    const method = 'GET';

    // Generate signature and timestamp
    const { signature, timestamp } = createSignature(method, request_path, params);

    // Prepare headers including required project header
    const headers = {
      'OK-ACCESS-KEY': api_config.api_key,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': api_config.passphrase,
      'OK-ACCESS-PROJECT': api_config.project,
      'Content-Type': 'application/json',
    };

    // Full path with query string
    const fullPath = request_path + '?' + querystring.stringify(params);

    const options = {
      hostname: 'web3.okx.com',
      path: fullPath,
      method,
      headers,
    };

    // Send GET request to OKX API
    const data: OkxApiResponse = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let body = '';
        response.on('data', (chunk) => (body += chunk));
        response.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch (error) {
            reject(new Error('Failed to parse JSON response'));
          }
        });
      });

      request.on('error', (err) => reject(err));
      request.end();
    });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
