import { kc } from "../routes/auth.route.js";
console.log(kc);
// Fetch historical OHLC data
export async function getHistoricalData(
  symbol,
  interval = "5minute",
  days = 5
) {
  try {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    console.log(kc);
    const candles = await kc.getHistoricalData(
      symbol,
      interval,
      from.toISOString(),
      to.toISOString()
    );

    // Transform to simpler format
    return candles.map((c) => ({
      date: new Date(c.date),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
    }));
  } catch (err) {
    console.error("Error fetching historical data:", err.message);
    return [];
  }
}
