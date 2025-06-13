import https from 'https';
import crypto from 'crypto';
import querystring from 'querystring';



const api_config: any = {
  api_key: process.env.API_KEY,
  secret_key: process.env.SECRET_KEY,
  passphrase: process.env.PASSPHRASE,
  project: process.env.PROJECT_ID,  // <-- Add your actual Project ID here
};

interface TxDetailByHashRequestBody {
  chainIndex: string;
  txHash: string;
  itype?: '0' | '1' | '2'; // optional, for layer type
}

// Helper to create preHash string for signing
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

export async function POST(req: Request) {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed, use POST' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON body
    const body: TxDetailByHashRequestBody = await req.json();
    const { chainIndex, txHash, itype } = body;

    if (!chainIndex || !txHash) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: chainIndex and txHash' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const request_path = '/api/v5/dex/post-transaction/transaction-detail-by-txhash';
    const method = 'GET';

    const params: Record<string, any> = { chainIndex, txHash };
    if (itype) {
      params.itype = itype;
    }

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
    const data = await new Promise((resolve, reject) => {
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
