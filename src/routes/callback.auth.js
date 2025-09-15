import { Router } from "express";

const callbackRouter = Router();
const kite = null;
callbackRouter.post("/callback", async (req, res) => {
  const { requestToken } = req.body;
  if (!kite) {
    return res
      .status(400)
      .json({ error: "Kite client not initialized. Call /auth/init first." });
  }
  if (!requestToken) {
    return res.status(400).json({ error: "request_token is required" });
  }

  try {
    const session = await kite.generateSession(
      requestToken,
      process.env.KITE_API_SECRET
    );

    // Save access token in memory
    process.env.KITE_ACCESS_TOKEN = session.access_token;

    // Set token on kite instance
    kite.setAccessToken(session.access_token);

    res.json({
      message: "Authentication successful",
      accessToken: session.access_token,
      user: session.user_id,
    });
  } catch (err) {
    console.error("Error generating session:", err.message);
    res.status(500).json({ error: "Failed to generate session" });
  }
});

export default callbackRouter;
