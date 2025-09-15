import express from "express";
import { getHistoricalData } from "../utils/fetchData.js";
import { kc } from "./auth.route.js";
import { generateSignal } from "../strategies/rsi_macd.js";

const tradeRouter = express.Router();

tradeRouter.post("/trade", async (req, res) => {
  try {
    const { symbol, side } = req.body;
    if (!symbol || !side) {
      return res.status(400).json({ error: "symbol and side are required" });
    }

    // Fetch historical data for strategy
    const data = await getHistoricalData(symbol, "5minute", 5);
    console.log(data);
    if (!data || data.length < 50) {
      return res.status(400).json({ error: "Not enough data for strategy" });
    }

    // Generate RSI + MACD signal
    const signal = generateSignal(data);

    if (
      (side === "BUY" && signal !== "BUY") ||
      (side === "SELL" && signal !== "SELL")
    ) {
      return res
        .status(400)
        .json({ error: `Strategy does not allow ${side} for ${symbol}` });
    }

    // Place order
    // const order = await kc.placeOrder("regular", {
    //   exchange: "NFO",
    //   tradingsymbol: symbol,
    //   transaction_type: side,
    //   quantity: 50, // adjust lot size
    //   product: "MIS",
    //   order_type: "MARKET",
    // });

    // res.json({ success: true, order });
  } catch (err) {
    console.error("Trade error:", err.message);
    res.status(500).json({ error: "Failed to place trade" });
  }
});

export default tradeRouter;
