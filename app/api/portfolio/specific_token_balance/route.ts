import https from 'https';
import crypto from 'crypto';

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

interface TokenContractAddress {
  chainIndex: string;
  tokenContractAddress: string; // "" for native token, or contract address
}

interface SpecificTokenBalanceRequestBody {
  address: string;
  tokenContractAddresses: TokenContractAddress[];
  excludeRiskToken?: '0' | '1'; // optional, default '0' (filter out risky tokens)
}

interface TokenAsset {
  chainIndex: string;
  tokenContractAddress: string;
  symbol: string;
  balance: string;
  rawBalance: string;
  tokenPrice: string;
  isRiskToken: boolean;
  address: string;
  tokenType?: string;
  transferAmount?: string;
  availableAmount?: string;
}

interface OkxApiResponse {
  code: string;
  msg: string;
  data: {
    tokenAssets: TokenAsset[];
  }[];
}

// Helper to create preHash string for signature (POST with JSON body)
function preHash(
  timestamp: string,
  method: string,
  request_path: string,
  body?: string
): string {
  return timestamp + method + request_path + (body || '');
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
  body?: string
) {
  const timestamp = new Date().toISOString().slice(0, -5) + 'Z';
  const message = preHash(timestamp, method, request_path, body);
  const signature = sign(message, api_config.secret_key);
  return { signature, timestamp };
}

export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed, use POST' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON body
    const body: SpecificTokenBalanceRequestBody = await req.json();

    const { address, tokenContractAddresses, excludeRiskToken } = body;

    if (!address || !tokenContractAddresses || !Array.isArray(tokenContractAddresses) || tokenContractAddresses.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid required parameters: address and tokenContractAddresses' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const request_path = '/api/v5/dex/balance/token-balances-by-address';
    const method = 'POST';

    // Prepare JSON body string for OKX API
    const okxBodyObj: Record<string, any> = {
      address,
      tokenContractAddresses,
    };
    if (excludeRiskToken !== undefined) {
      okxBodyObj.excludeRiskToken = excludeRiskToken;
    }
    const okxBody = JSON.stringify(okxBodyObj);

    // Generate signature and timestamp
    const { signature, timestamp } = createSignature(method, request_path, okxBody);

    // Prepare headers including required project header
    const headers = {
      'OK-ACCESS-KEY': api_config.api_key,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': api_config.passphrase,
      'OK-ACCESS-PROJECT': api_config.project,
      'Content-Type': 'application/json',
    };

    // HTTPS request options
    const options = {
      hostname: 'web3.okx.com',
      path: request_path,
      method,
      headers,
    };

    // Send POST request to OKX API
    const data: OkxApiResponse = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          try {
            const json = JSON.parse(responseBody);
            resolve(json);
          } catch (error) {
            reject(new Error('Failed to parse JSON response'));
          }
        });
      });

      request.on('error', (err) => reject(err));
      request.write(okxBody);
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
