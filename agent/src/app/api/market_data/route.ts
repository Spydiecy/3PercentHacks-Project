import https from 'https';
import crypto from 'crypto';
import querystring from 'querystring';

const api_config = {
  api_key: process.env.OKX_API_KEY || '64bb967c-14de-4e86-b356-e1ee768ed2e2',
  secret_key: process.env.OKX_SECRET_KEY || '1A29A90AEE915C983970FBCAD1ADC90B',
  passphrase: process.env.OKX_PASSPHRASE || 'Naman@2005'
};

function preHash(timestamp: any, method: any, request_path: any, bodyOrParams: any) {
  let str = '';
  if (method === 'GET' && bodyOrParams) {
    str = '?' + querystring.stringify(bodyOrParams);
  } else if (method === 'POST' && bodyOrParams) {
    str = JSON.stringify(bodyOrParams);
  }
  return timestamp + method + request_path + str;
}

function sign(message: any, secret_key: any) {
  return crypto.createHmac('sha256', secret_key).update(message).digest('base64');
}

function sendRequest(method: any, request_path: any, data: any, callback: any) {
  const timestamp = new Date().toISOString();
  const pre_signed = preHash(timestamp, method, request_path, data);
  const signature = sign(pre_signed, api_config.secret_key);

  const headers = {
    'OK-ACCESS-KEY': api_config.api_key,
    'OK-ACCESS-SIGN': signature,
    'OK-ACCESS-TIMESTAMP': timestamp,
    'OK-ACCESS-PASSPHRASE': api_config.passphrase,
    'Content-Type': 'application/json'
  };

  const options = {
    hostname: 'web3.okx.com',
    path: method === 'GET' && data ? request_path + '?' + querystring.stringify(data) : request_path,
    method,
    headers
  };

  const req = https.request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(rawData);
        callback(null, parsed);
      } catch (e) {
        callback(e, null);
      }
    });
  });

  req.on('error', (e) => callback(e, null));

  if (method === 'POST' && data) {
    req.write(JSON.stringify(data));
  }

  req.end();
}

export async function POST(req: any) {
  const body = await req.json();
  const { okxMethod, path, data } = body;

  if (!okxMethod || !path) {
    return Response.json({ error: 'Missing okxMethod or path' }, { status: 400 });
  }

  return new Promise((resolve) => {
    sendRequest(okxMethod.toUpperCase(), path, data, (err: any, response: any) => {
      if (err) {
        resolve(Response.json({ error: 'Failed to fetch from OKX', details: err.message }, { status: 500 }));
      } else {
        resolve(Response.json({ data: response }));
      }
    });
  });
}
