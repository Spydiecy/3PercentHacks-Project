import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import crypto from 'crypto';
import querystring from 'querystring';

// API credentials
const api_config = {
  api_key: "64bb967c-14de-4e86-b356-e1ee768ed2e2",
  secret_key: "1A29A90AEE915C983970FBCAD1ADC90B",
  passphrase: "Naman@2005",
};

function preHash(timestamp: string, method: string, request_path: string, params: any) {
  let query_string = '';
  if (method === 'GET' && params) {
    query_string = '?' + querystring.stringify(params);
  }
  if (method === 'POST' && params) {
    query_string = JSON.stringify(params);
  }
  return timestamp + method + request_path + query_string;
}

function sign(message: string, secret_key: string) {
  const hmac = crypto.createHmac('sha256', secret_key);
  hmac.update(message);
  return hmac.digest('base64');
}

function createSignature(method: string, request_path: string, params: any) {
  // Get the timestamp in ISO 8601 format
  const timestamp = new Date().toISOString();
  const message = preHash(timestamp, method, request_path, params);
  const signature = sign(message, api_config.secret_key);
  return { signature, timestamp };
}

function sendGetRequest(request_path: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log("Get Request function running:::");

    // Handle case where params is an array (you only use one object in the array)
    const queryParams = Array.isArray(params) ? params[0] : params;

    // Generate a signature
    const { signature, timestamp } = createSignature("GET", request_path, queryParams);

    // Generate the request header
    const headers = {
      'OK-ACCESS-KEY': api_config.api_key,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': api_config.passphrase,
      'Content-Type': 'application/json'
    };

    const fullPath = request_path + (queryParams ? `?${querystring.stringify(queryParams)}` : '');

    const options = {
      hostname: 'www.okx.com',
      path: fullPath,
      method: 'GET',
      headers: headers
    };

    console.log('My options are:::', options);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(`Failed to parse JSON: ${data}`);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}
function sendPostRequest(request_path: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Generate a signature
    const { signature, timestamp } = createSignature("POST", request_path, params);

    // Generate the request header
    const headers = {
      'OK-ACCESS-KEY': api_config.api_key,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': api_config.passphrase,
      'Content-Type': 'application/json'
    };

    const options = {
      hostname: 'www.okx.com',
      path: request_path,
      method: 'POST',
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(`Failed to parse JSON: ${data}`);
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (params) {
      req.write(JSON.stringify(params));
    }

    req.end();
  });
}

// GET route handler
export async function GET(req: NextRequest) {
  try {
    // Get query parameters from the URL
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    const dataParam = url.searchParams.get('data');
    
    if (!path) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Parse data if provided
    let data = {};
    if (dataParam) {
      try {
        data = JSON.parse(dataParam);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid data parameter' }, { status: 400 });
      }
    }

    const response = await sendGetRequest(path, data);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
}

// POST route handler
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, path, data } = body;

    if (!path) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Handle based on method
    if (method === 'GET') {
      const response = await sendGetRequest(path, data || {});
      return NextResponse.json(response);
    } else if (method === 'POST') {
      const response = await sendPostRequest(path, data || {});
      return NextResponse.json(response);
    } else {
      return NextResponse.json({ error: 'Invalid method. Use GET or POST' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.toString() }, { status: 500 });
  }
}