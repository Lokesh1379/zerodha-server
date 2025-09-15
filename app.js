import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import callbackRouter from "./src/routes/callback.auth.js";
// import profileRouter from "./src/routes/profile.auth.js";
import {
  authRouter,
  callbackRouter,
  profileRouter,
} from "./src/routes/auth.route.js";
import expiryRouter from "./src/routes/expiry.routes.js";
import optionsRouter from "./src/routes/strikeprices.routes.js";
import tradeRouter from "./src/routes/trade.router.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

export let kite = null;

app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/auth`, callbackRouter);
app.use(`/api/v1/auth`, profileRouter);
app.use(`/api/v1`, expiryRouter);
app.use(`/api/v1`, optionsRouter);
app.use(`/api/v1`, tradeRouter);

// Step 3: Example endpoint to verify connection
app.get("/profile", async (req, res) => {
  if (!kite) return res.status(400).json({ error: "Kite not initialized" });
  try {
    const profile = await kite.getProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend running at http://localhost:${PORT}`)
);
