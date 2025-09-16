import { KiteConnect } from "kiteconnect";

let kc = null;
let apiSecret = null;

export function initKite(apiKey, secret) {
  kc = new KiteConnect({ api_key: apiKey });
  apiSecret = secret;
  return kc;
}

export function getKite() {
  if (!kc)
    throw new Error("❌ Kite client not initialized. Call /auth/init first.");
  return kc;
}

export function getApiSecret() {
  if (!apiSecret)
    throw new Error("❌ API secret not set. Call /auth/init first.");
  return apiSecret;
}
