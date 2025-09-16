import express from "express";
import { KiteConnect } from "kiteconnect";

const profileRouter = express.Router();
const authRouter = express.Router();
const callbackRouter = express.Router();
export let kc = null; // store Kite client temporarily
let apiSecret = null; // store apiSecret for later

// Step 1: Init (store apiKey + apiSecret, return loginUrl)
authRouter.post("/init", (req, res) => {
  const { apiKey, apiSecret: secret } = req.body;
  if (!apiKey || !secret) {
    return res.status(400).json({ error: "API Key and Secret required" });
  }

  kc = new KiteConnect({ api_key: apiKey });
  apiSecret = secret;

  return res.json({ loginUrl: kc.getLoginURL() });
});

// Step 2: Callback (exchange request_token → access_token)
callbackRouter.post("/callback", async (req, res) => {
  try {
    if (!kc) {
      return res
        .status(400)
        .json({ error: "Kite client not initialized. Call /auth/init first." });
    }

    const { request_token } = req.body;
    if (!request_token) {
      return res.status(400).json({ error: "requestToken is required" });
    }

    const session = await kc.generateSession(request_token, apiSecret);
    kc.setAccessToken(session.access_token);

    console.log("Kite session established");
    // ✅ Store access_token somewhere safe (DB, Redis, file, etc.)
    return res.json({
      message: "Authentication successful",
      accessToken: session.access_token,
      user: session.user_id,
    });
  } catch (err) {
    console.error("Error in /callback:", err);
    return res.status(500).json({ error: "Failed to generate session" });
  }
});

// Verify connection and fetch user profile
profileRouter.get("/profile", async (req, res) => {
  console.log("Fetching profile...");
  if (!kc) return res.status(400).json({ error: "Kite not initialized" });

  try {
    const profile = await kc.getProfile();
    res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});
export { authRouter, callbackRouter, profileRouter };
