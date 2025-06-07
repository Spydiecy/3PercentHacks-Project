// app/api/okx-crosschain/route.ts
import { NextRequest, NextResponse } from "next/server";
import https from "https";
import crypto from "crypto";
import querystring from "querystring";

// Your OKX API credentials
const api_config = {
  api_key: "64bb967c-14de-4e86-b356-e1ee768ed2e2",
  secret_key: "1A29A90AEE915C983970FBCAD1ADC90B",
  passphrase: "Naman@2005",
};

// Fetch OKX server timestamp and convert to ISO 8601 string
function getServerTimestamp(): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get("https://www.okx.com/api/v5/public/time", (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          const ms = Number(parsed.data[0].ts);
          const isoTimestamp = new Date(ms).toISOString();
          resolve(isoTimestamp);
        } catch (err) {
          reject(new Error("Failed to parse OKX server time"));
        }
      });
    }).on("error", (err) => reject(err));
  });
}

// Create prehash string for signing
function preHash(timestamp: string, method: string, request_path: string, params: any) {
  let query_string = "";
  if (method === "GET" && params && Object.keys(params).length > 0) {
    query_string = "?" + querystring.stringify(params);
  }
  return timestamp + method + request_path + query_string;
}

// Generate HMAC SHA256 signature and encode base64
function sign(message: string, secret_key: string) {
  const hmac = crypto.createHmac("sha256", secret_key);
  hmac.update(message);
  return hmac.digest("base64");
}

// Create signature and timestamp for request
async function createSignature(method: string, request_path: string, params: any) {
  const timestamp = await getServerTimestamp();
  const message = preHash(timestamp, method, request_path, params);
  const signature = sign(message, api_config.secret_key);
  return { signature, timestamp };
}

// HTTPS agent enforcing TLS v1.2
const agent = new https.Agent({
  keepAlive: true,
  minVersion: "TLSv1.2",
});

// Send GET request to OKX API
async function sendGetRequest(request_path: string, params: any): Promise<any> {
  const { signature, timestamp } = await createSignature("GET", request_path, params);

  const headers = {
    "OK-ACCESS-KEY": api_config.api_key,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": api_config.passphrase,
    "Content-Type": "application/json",
  };

  const fullPath = request_path + (params && Object.keys(params).length > 0 ? "?" + querystring.stringify(params) : "");

  const options = {
    hostname: "www.okx.com",
    path: fullPath,
    method: "GET",
    headers,
    agent,
    timeout: 10000,
  };
  console.log("my options are::::::",options);
  

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${data}`));
        }
      });
    });

    req.on("error", (err) => reject(new Error(`Request error: ${err.message}`)));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    req.end();
  });
}

// API route handler for cross-chain build-tx
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required parameters
    const requiredParams = [
      "amount",
      "fromChainIndex",
      "toChainIndex",
      "fromChainId",
      "toChainId",
      "fromTokenAddress",
      "toTokenAddress",
      "slippage",
      "userWalletAddress",
    ];
    for (const param of requiredParams) {
      if (!body[param]) {
        return NextResponse.json({ error: `Missing required parameter: ${param}` }, { status: 400 });
      }
    }

    const request_path = "/api/v5/dex/cross-chain/build-tx";
    const params = { ...body };

    const response = await sendGetRequest(request_path, params);

    if (response.code !== "0") {
      return NextResponse.json({ error: response.msg || "OKX API error", code: response.code }, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
